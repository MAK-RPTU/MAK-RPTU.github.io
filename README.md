# Portfolio site

Static GitHub Pages site that showcases video recordings and photos per project.

## Structure

```
portfolio-site/
├── index.html                       # Landing page with project tiles
├── assets/style.css                 # Shared styles
└── projects/
    ├── john-deere/
    │   ├── index.html               # Project page
    │   ├── videos/                  # Drop .mp4 files here
    │   └── images/                  # Drop .jpg / .png files here
    └── agilex-scout-mini/
        ├── index.html
        ├── videos/
        └── images/
```

## Adding a video

1. Copy the `.mp4` into the project's `videos/` folder.
2. Open the project's `index.html`, find the commented `<article class="video-card">` block, and copy it into the grid above the `empty-state`.
3. Update the `<source src="...">` filename and the title/description in `<h4>` and `<p>`.
4. Remove the `empty-state` block once you have at least one card.

Keep files under 100 MB (GitHub's per-file limit). For larger files use Git LFS or YouTube unlisted embeds.

## Adding a photo

Drop the file into the project's `images/` folder and add an `<img>` tag in the `image-grid` section of the project's `index.html`.

## Adding a new project

1. Duplicate one of the folders under `projects/` (e.g. copy `john-deere/` to `projects/<new-project>/`).
2. Edit the `<title>`, `<h1>`, lede, and tags inside its `index.html`.
3. Add a new `<a class="project-card">` tile in the root `index.html`.

## Publishing to GitHub Pages (user site)

A "user site" lives at `https://<your-username>.github.io` and the repo must be named exactly `<your-username>.github.io`.

```powershell
# from inside the portfolio-site folder
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
# create the repo on github.com first, named <your-username>.github.io, then:
git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
git push -u origin main
```

In the repo on github.com → **Settings → Pages**:
- Source: `Deploy from a branch`
- Branch: `main` / root `/`

The site is live at `https://<your-username>.github.io` within ~1 minute.

## Local preview

From inside `portfolio-site/`:

```powershell
python -m http.server 8080
```

Then open http://localhost:8080.
