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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// курсор
const mouse = { x: 0.5, y: 0.5 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
});

// шейдер
const material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    fragmentShader: `
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float dist = distance(st, u_mouse);
            vec3 color = vec3(0.0);

            color = mix(color, vec3(0.2, 0.6, 1.0), exp(-10.0 * dist * dist));

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate(time) {
    material.uniforms.u_time.value = time * 0.001;
    material.uniforms.u_mouse.value.set(mouse.x, mouse.y);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// автообновление при ресайзе окна
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
