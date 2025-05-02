let playlists = [];
let editIndex = null;

// Utility: Shuffle array in place, forgot the name of the algorithm used !
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Renders modal with playlist details
function renderModal(pl) {
    const modal = document.getElementById("myModal");
    const modalContent = modal?.querySelector(".modal-content");
    if (!modal || !modalContent) return;

    const songs = pl.songs || [];

    modalContent.innerHTML = `
    <span class="close">&times;</span>
    <h2>${pl.name.toUpperCase()}</h2>
    <h4>Created by: ${pl.author}</h4>
    <div class="song-list">
      <button class="playlist-button-shuffle">Shuffle Playlist</button>
      ${songs.map(song => `
        <div class="song-row">
          <div class="song-info">
            <img src="${song.cover}" alt="${song.name}" class="playlist-cover"/>
            <span><strong>Song Title:</strong> ${song.title}</span>
            <span><strong>Artist:</strong> ${song.artist}</span>
            <span><strong>Duration:</strong> ${song.duration}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    modal.style.display = "block";
    modal.querySelector(".close").onclick = () => modal.style.display = "none";
    window.onclick = event => {
        if (event.target == modal) modal.style.display = "none";
    };

    modalContent.querySelector(".playlist-button-shuffle").addEventListener("click", () => {
        const shuffled = [...songs];
        shuffleArray(shuffled);
        const songList = modalContent.querySelector(".song-list");
        songList.innerHTML = `
      <button class="playlist-button-shuffle">Shuffle Playlist</button>
      ${shuffled.map(song => `
        <div class="song-row">
          <div class="song-info">
            <img src="${song.cover}" alt="${song.name}" class="playlist-cover"/>
            <span><strong>Song Title:</strong> ${song.title}</span>
            <span><strong>Artist:</strong> ${song.artist}</span>
            <span><strong>Duration:</strong> ${song.duration}</span>
          </div>
        </div>
      `).join('')}
    `;
        songList.querySelector(".playlist-button-shuffle").addEventListener("click", () => renderModal(pl));
    });
}

// Renders playlist cards, this is where the magic happens
function renderPlaylists(listOverride = null) {
    const container = document.getElementById("playlist-cards");
    if (!container) return;
    container.innerHTML = "";

    const data = listOverride || playlists;

    data.forEach((pl, index) => {
        const card = document.createElement("div");
        card.className = "playlist-card";

        //Unicode emojis: 
        //Unicode character U+2764 FE0F (RED)
        //Unicode character U+1F90D (WHITE)
        card.innerHTML = `
      <img class="artist-img" src="${pl.cover}" alt="${pl.author}" />
      <div class="artist-name">Author: ${pl.author}</div>
      <div class="artist-playlist">Name: ${pl.name}</div>
      <div class="playlist-actions">
    <button class="action-btn like-btn ${pl.liked ? "liked" : "unliked"}" data-index="${index}">
      ${pl.liked ? "❤️ Liked (" + pl.likes + ")" : "🤍 Like (" + pl.likes + ")"}
    </button>
    <button class="action-btn edit-btn" data-index="${index}">✏️ Edit</button>
    <button class="action-btn delete-btn" data-index="${index}">🗑️ Delete</button>
  </div>
    `;

        card.querySelector(".artist-img").addEventListener("click", () => renderModal(pl));
        card.querySelector(".like-btn").addEventListener("click", () => {
            pl.liked = !pl.liked;
            pl.likes += pl.liked ? 1 : -1;
            renderPlaylists();
        });
        card.querySelector(".edit-btn").addEventListener("click", () => {
            document.getElementById("name").value = pl.name;
            document.getElementById("author").value = pl.author;
            document.getElementById("cover").value = pl.cover;
            document.getElementById("songs").value = pl.songs.map(s => `${s.title}|${s.artist}|${s.duration}`).join(", ");
            document.getElementById("formModal").style.display = "block";
            document.getElementById("formTitle").innerText = "Edit Playlist";
            editIndex = index;
        });
        card.querySelector(".delete-btn").addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete the playlist '${pl.name}'?`)) {
                playlists.splice(index, 1);
                renderPlaylists();
            }
        });

        container.appendChild(card);
    });
}

// Featured Playlist
function renderFeaturedPlaylist() {
    const container = document.getElementById("shuffled-playlist-home");
    if (!container || playlists.length === 0) return;

    const featured = playlists[Math.floor(Math.random() * playlists.length)];

    container.innerHTML = `
    <div class="featured-playlist">
      <div class="playlist-left">
        <img src="${featured.cover}" alt="${featured.name}" class="playlist-cover"/>
        <h2>${featured.name}</h2>
        <p><strong>Author:</strong> ${featured.author}</p>
        <p><strong>Likes:</strong> ❤️ ${featured.likes}</p>
      </div>
      <div class="playlist-right">
        <h3>Songs</h3>
        <ul class="song-list">
          ${featured.songs.map(song => `
            <li class="song-item">
              <strong>${song.title}</strong> – ${song.artist} <span class="duration">${song.duration}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Filter + Sort handling
function filterAndSortPlaylists() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const sortValue = document.getElementById("sort-select").value;

    let filtered = playlists.filter(pl =>
        pl.name.toLowerCase().includes(searchInput) ||
        pl.author.toLowerCase().includes(searchInput)
    );

    if (sortValue === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === "likes") {
        filtered.sort((a, b) => b.likes - a.likes);
    }

    renderPlaylists(filtered);
}

// Add/Edit modal handlers
const openFormBtn = document.getElementById("open-form-btn");
const formModal = document.getElementById("formModal");
const formClose = document.getElementById("formClose");
const playlistForm = document.getElementById("playlist-form");

if (openFormBtn && formModal && formClose && playlistForm) {
    openFormBtn.addEventListener("click", () => {
        formModal.style.display = "block";
        document.getElementById("formTitle").innerText = "Add Playlist";
        playlistForm.reset();
        editIndex = null;
    });

    formClose.addEventListener("click", () => {
        formModal.style.display = "none";
        playlistForm.reset();
    });

    playlistForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const author = document.getElementById("author").value.trim();
        const cover = document.getElementById("cover").value.trim();
        const songsRaw = document.getElementById("songs").value.trim();

        const songs = songsRaw.split(",").map(s => {
            const [title, artist, duration, cover] = s.split("|").map(x => x.trim());
            return { title, artist, duration, cover };
        });

        const newPlaylist = { name, author, cover, songs, likes: 0, liked: false };

        if (editIndex !== null) {
            playlists[editIndex] = newPlaylist;
        } else {
            playlists.push(newPlaylist);
        }

        formModal.style.display = "none";
        playlistForm.reset();
        renderPlaylists();
    });
}

// Initial load and listeners, needed to add this because for some reason was getting errors in the console because my elements could not be found.
document.addEventListener("DOMContentLoaded", () => {
    fetch("./data/data.js")
        .then(res => res.json())
        .then(data => {
            playlists = data;
            renderPlaylists();
            renderFeaturedPlaylist();
        })
        .catch(err => console.error("Failed to load playlist data:", err));

    // Search and Sort listeners
    document.getElementById("search-input")?.addEventListener("input", filterAndSortPlaylists);
    document.getElementById("sort-select")?.addEventListener("change", filterAndSortPlaylists);
});
