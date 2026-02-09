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
        <a href="./" class="back">
        <img src="icons/back.svg" alt="Назад">
      </a>

      <div class="description">
        <p><strong>${item.title}</strong></p>
        <p>${item.year} · ${item.size}</p>
        <p>${item.tech}</p>
        <p class="price">${item.price}</p>
        <br>
        <p>${item.description}</p>
        
        <a href="https://t.me/pds_yes/5" class="buy-btn" target="_blank">
          Купить картину
        </a>
      </div>
    </div>

    <div class="painting-image">
      <img src="${item.image}" alt="${item.title}">
    </div>
  `;
        }

    });

