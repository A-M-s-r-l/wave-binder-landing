document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("article-grid");
    const loadMoreBtn = document.getElementById("load-more-btn");

    if (!grid) {
        return;
    }

    const batchSize = 3;
    let allArticles = [];
    let currentIndex = 0;

    try {
        const res = await fetch("../blog/index.json");

        if (!res.ok) {
            throw new Error("Failed to fetch index.json");
        }

        allArticles = await res.json();
        allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

        loadArticles();

        if (loadMoreBtn) {
            if (window.location.pathname.includes("/blog")) {
                loadMoreBtn.addEventListener("click", loadArticles);
            } else {
                loadMoreBtn.addEventListener("click", () => {
                    window.location.href = "/blog";
                });
            }
        }
    } catch (err) {
        console.error("Error loading articles:", err);
        grid.innerHTML = "<p>Failed to load articles.</p>";

        if (loadMoreBtn) {
            loadMoreBtn.style.display = "none";
        }
    }

    function loadArticles() {
        const nextBatch = allArticles.slice(currentIndex, currentIndex + batchSize);

        nextBatch.forEach((article) => {
            const articleEl = document.createElement("div");
            articleEl.classList.add("article");

            articleEl.innerHTML = `
                <div class="article-card">
                    <img src="/assets/logo-nav.svg" alt="logo"/>
                    <h2>${article.title}</h2>
                </div>
                <h3>${article.title}</h3>
                <span>
                    ${new Date(article.date).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    })} by ${article.author}
                </span>
            `;

            articleEl.addEventListener("click", () => {
                window.open(`/blog/articles/${article.slug}`, "_blank");
            });

            articleEl.setAttribute("role", "link");
            articleEl.setAttribute("aria-label", `Open article ${article.title}`);

            grid.appendChild(articleEl);
            requestAnimationFrame(() => articleEl.classList.add("loaded"));
        });

        currentIndex += nextBatch.length;

        if (loadMoreBtn && currentIndex >= allArticles.length) {
            loadMoreBtn.style.display = "none";
        }
    }
});
