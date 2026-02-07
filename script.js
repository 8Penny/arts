fetch('data.json')
    .then(res => res.json())
    .then(data => {
        const gallery = document.getElementById('gallery');
        const painting = document.getElementById('painting');

        if (gallery) {
            data.forEach(item => {
                gallery.innerHTML += `
          <a href="painting.html?id=${item.id}" class="card">
            <img src="${item.preview}" alt="${item.title}">
            <div class="caption">${item.year} · ${item.size}</div>
          </a>
        `;
            });
        }

        if (painting) {
            const id = new URLSearchParams(window.location.search).get('id');
            const item = data.find(p => p.id === id);

            painting.innerHTML = `
    <div>
      <a href="index.html" class="back">
        <img src="icons/back.svg" alt="Назад">
      </a>

      <div class="description">
        <p><strong>${item.title}</strong></p>
        <p>${item.year} · ${item.size}</p>
        <p>${item.tech}</p>
        <br>
        <p>${item.description}</p>
      </div>
    </div>

    <div class="painting-image">
      <img src="${item.image}" alt="${item.title}">
    </div>
  `;
        }

    });


const canvas = document.getElementById('shader-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// курсор
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
});

// массив точек (максимум 100)
const MAX_POINTS = 100;
const points = [];
for (let i = 0; i < MAX_POINTS; i++) {
    points.push({ pos: new THREE.Vector2(0, 0), birth: -1000 });
}

// шейдер
const material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_pointsPos: { value: points.map(p => p.pos) },
        u_pointsBirth: { value: points.map(p => p.birth) },
        u_maxPoints: { value: MAX_POINTS }
    },
    fragmentShader: `
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_pointsPos[100];
        uniform float u_pointsBirth[100];
        uniform int u_maxPoints;

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            vec3 color = vec3(1.0);

            for(int i = 0; i < 100; i++) {
                if(i >= u_maxPoints) break;

                vec2 p = u_pointsPos[i];
                float birth = u_pointsBirth[i];
                float age = u_time - birth;
                if(age < 0.0) continue;

                float radius = 0.02;                     // меньше размер
                float d = distance(st, p) / radius;      // учитываем радиус
                float alpha = exp(-10.0 * d * d) * exp(-age * 2.5); // fade out быстрее

                // радужный желто-оранжевый градиент
                vec3 col = vec3(1.0, 0.7, 0.0) * (0.5 + 0.5 * sin(age * 3.0)); 
                color = color * (1.0 - alpha) + col * alpha;

                //color += col * alpha;
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// добавляем точку при движении курсора
function addPoint() {
    // ищем старую точку
    let oldest = points[0];
    for (let p of points) {
        if (p.birth < oldest.birth) oldest = p;
    }
    oldest.pos.set(mouse.x, mouse.y);
    oldest.birth = material.uniforms.u_time.value;
}

// анимация
function animate(time) {
    material.uniforms.u_time.value = time * 0.001;

    // обновляем массив точек в шейдере
    material.uniforms.u_pointsPos.value = points.map(p => p.pos);
    material.uniforms.u_pointsBirth.value = points.map(p => p.birth);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// при движении курсора создаём новые точки
window.addEventListener('mousemove', () => {
    addPoint();
});

// ресайз
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
