// App Logic

const app = {
    data: null,
    isAdmin: false,

    init() {
        this.loadData();
        this.render();
        this.setupEventListeners();
        this.checkAdminState();
        lucide.createIcons();
    },

    loadData() {
        const stored = localStorage.getItem('portfolioData');
        const fileData = window.portfolioData || {};

        if (stored) {
            const parsed = JSON.parse(stored);
            if (fileData._version && (!parsed._version || fileData._version > parsed._version)) {
                console.log('New version detected. Updating local storage.');
                this.data = fileData;
                this.saveData();
            } else {
                this.data = parsed;
            }
        } else {
            this.data = fileData;
        }
    },

    saveData() {
        localStorage.setItem('portfolioData', JSON.stringify(this.data));
        alert('Changes saved locally! To make them permanent, use the "Export Data" button and replace the content of js/data.js.');
    },

    resetData() {
        if (confirm('Are you sure you want to reset all changes?')) {
            localStorage.removeItem('portfolioData');
            location.reload();
        }
    },

    exportData() {
        const dataStr = "window.portfolioData = " + JSON.stringify(this.data, null, 4) + ";";
        const blob = new Blob([dataStr], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "data.js";
        a.click();
    },

    render() {
        // 1. Text Content & Links
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            const value = this.getNestedValue(this.data, key);
            if (value) {
                el.innerText = value;
                // Special handling for links
                if (key === 'contact.email') el.setAttribute('href', `mailto:${value}`);
                if (key === 'contact.phone') el.setAttribute('href', `tel:${value.replace(/\s+/g, '')}`);
                if (key === 'contact.linkedin') el.setAttribute('href', value.startsWith('http') ? value : `https://${value}`);
            }
        });

        // 2. Skills
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = this.data.skills.map((s, index) => `
            <div class="skill-card" onclick="app.editItem('skills', ${index})">
                <h3>${s.name}</h3>
                <div class="skill-level">
                    <div class="skill-fill" style="width: ${s.level}%"></div>
                </div>
            </div>
        `).join('');

        // 3. Projects
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = this.data.projects.map((p, index) => `
            <div class="project-card">
                <div onclick="app.editItem('projects', ${index})">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="project-tags">
                        ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                </div>
                <button class="btn btn-sm btn-outline" style="margin-top: 1rem; width: 100%;" onclick="app.openProjectModal(${index})">
                    <i data-lucide="code"></i> View Code
                </button>
            </div>
        `).join('');

        // 4. Moments
        const momentsContainer = document.getElementById('moments-container');
        momentsContainer.innerHTML = this.data.moments.map((m, index) => `
            <div class="moment-card" style="background-image: url('${m.image || ''}'); background-size: cover; background-position: center;" onclick="app.editItem('moments', ${index})">
                <div class="moment-content">
                    <h4>${m.caption}</h4>
                    <span class="tag">${m.date}</span>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    },

    openAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        const input = document.getElementById('admin-password-input');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
        setTimeout(() => input.focus(), 100);
    },

    closeAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.getElementById('admin-password-input').value = '';
        }, 300);
    },

    checkAdminPassword() {
        const input = document.getElementById('admin-password-input');
        const pass = input.value;

        if (pass === '962006') {
            this.toggleAdmin(true);
            this.closeAdminLogin();
        } else {
            alert('Incorrect password');
            input.value = '';
            input.focus();
        }
    },

    openProjectModal(index) {
        const project = this.data.projects[index];
        if (!project) return;

        document.getElementById('modal-title').innerText = project.title;
        document.getElementById('modal-desc').innerText = project.description;
        document.getElementById('modal-code').innerText = project.snippet || "// No snippet available";
        document.getElementById('modal-repo-link').href = project.repoUrl || "#";

        const modal = document.getElementById('code-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeModal() {
        const modal = document.getElementById('code-modal');
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    },

    copyCode() {
        const code = document.getElementById('modal-code').innerText;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copy-btn');
            const original = btn.innerText;
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = original, 2000);
        });
    },

    getNestedValue(obj, key) {
        return key.split('.').reduce((o, i) => (o ? o[i] : null), obj);
    },

    setNestedValue(obj, key, value) {
        const keys = key.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    },

    setupEventListeners() {
        document.getElementById('admin-toggle').addEventListener('click', () => {
            if (!this.isAdmin) {
                this.openAdminLogin();
            } else {
                this.toggleAdmin(false);
            }
        });

        document.getElementById('admin-login-submit').addEventListener('click', () => this.checkAdminPassword());
        document.getElementById('admin-login-cancel').addEventListener('click', () => this.closeAdminLogin());

        document.getElementById('admin-password-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAdminPassword();
        });

        document.getElementById('close-admin').addEventListener('click', () => this.toggleAdmin(false));
        document.getElementById('save-btn').addEventListener('click', () => this.saveData());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetData());
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());

        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyCode());

        document.getElementById('code-modal').addEventListener('click', (e) => {
            if (e.target.id === 'code-modal') this.closeModal();
        });

        document.querySelectorAll('.editable').forEach(el => {
            el.addEventListener('blur', (e) => {
                const key = e.target.getAttribute('data-key');
                this.setNestedValue(this.data, key, e.target.innerText);
                this.render();
            });

            // Prevent link navigation in admin mode
            el.addEventListener('click', (e) => {
                if (this.isAdmin && el.tagName === 'A') {
                    e.preventDefault();
                }
            });
        });

        // Image Editable Listeners (Event Delegation for reliability)
        document.addEventListener('click', (e) => {
            if (this.isAdmin && e.target.classList.contains('editable-img')) {
                e.preventDefault();
                e.stopPropagation();

                const key = e.target.getAttribute('data-key');
                const current = this.getNestedValue(this.data, key);
                const newUrl = prompt("Enter new Image URL:", current);

                if (newUrl !== null) {
                    this.setNestedValue(this.data, key, newUrl);
                    this.render();
                }
            }
        });
    },

    toggleAdmin(state) {
        this.isAdmin = state;
        if (state) {
            document.body.classList.add('admin-mode');
            document.getElementById('admin-panel').classList.remove('hidden');

            document.querySelectorAll('.editable').forEach(el => {
                el.contentEditable = true;
                el.classList.add('editable-active');
            });
        } else {
            document.body.classList.remove('admin-mode');
            document.getElementById('admin-panel').classList.add('hidden');

            document.querySelectorAll('.editable').forEach(el => {
                el.contentEditable = false;
                el.classList.remove('editable-active');
            });
        }
    },

    checkAdminState() {
        // Could persist session
    },

    addItem(type) {
        if (!this.isAdmin) return;

        let newItem;
        if (type === 'projects') {
            const title = prompt("Enter Project Title:");
            if (!title) return;

            const description = prompt("Enter Description:");
            const tagsStr = prompt("Enter Tags (comma separated):", "React, JS");
            const repoUrl = prompt("Enter GitHub Repo URL:", "https://github.com/...");
            const snippet = prompt("Enter Code Snippet:", "// Code here");

            newItem = {
                title,
                description: description || "No description",
                tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : [],
                link: "#",
                repoUrl: repoUrl || "#",
                snippet: snippet || "// No snippet"
            };
        } else if (type === 'moments') {
            const caption = prompt("Enter Moment Caption (Title):");
            if (!caption) return;

            const date = prompt("Enter Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
            const image = prompt("Enter Image URL (https://...):", "https://via.placeholder.com/400");

            newItem = { caption, date: date || "2026-01-01", image: image || "" };
        } else if (type === 'skills') {
            const name = prompt("Enter Skill Name:");
            if (!name) return;

            const level = prompt("Enter Proficiency Level (0-100):", "50");
            newItem = { name, level: parseInt(level) || 50 };
        }

        if (newItem) {
            this.data[type].push(newItem);
            this.render();
            if (this.isAdmin) this.toggleAdmin(true);
        }
    },

    editItem(type, index) {
        if (!this.isAdmin) return;

        const item = this.data[type][index];

        if (type === 'moments') {
            if (!confirm(`Edit Moment: "${item.caption}"?\nClick OK to Edit, Cancel to potentially Delete.`)) {
                if (confirm("Delete this moment?")) {
                    this.data[type].splice(index, 1);
                    this.render();
                    if (this.isAdmin) this.toggleAdmin(true);
                }
                return;
            }

            const newCaption = prompt(`Edit Caption:`, item.caption);
            if (newCaption !== null) item.caption = newCaption;

            const newDate = prompt(`Edit Date:`, item.date);
            if (newDate !== null) item.date = newDate;

            const newImage = prompt(`Edit Image URL:`, item.image);
            if (newImage !== null) item.image = newImage;

            this.render();
            return;
        }

        if (type === 'skills') {
            if (!confirm(`Edit Skill: "${item.name}"?`)) {
                if (confirm("Delete this skill?")) {
                    this.data[type].splice(index, 1);
                    this.render();
                    if (this.isAdmin) this.toggleAdmin(true);
                }
                return;
            }

            const newName = prompt(`Edit Skill Name:`, item.name);
            if (newName !== null) item.name = newName;

            const newLevel = prompt(`Edit Level (0-100):`, item.level);
            if (newLevel !== null) item.level = Number(newLevel);

            this.render();
            return;
        }

        if (type === 'projects') {
            if (!confirm(`Edit Project: "${item.title}"?\nClick OK to Edit, Cancel to potentially Delete.`)) {
                if (confirm("Delete this project?")) {
                    this.data[type].splice(index, 1);
                    this.render();
                    if (this.isAdmin) this.toggleAdmin(true);
                }
                return;
            }

            const newTitle = prompt("Edit Title:", item.title);
            if (newTitle !== null) item.title = newTitle;

            const newDesc = prompt("Edit Description:", item.description);
            if (newDesc !== null) item.description = newDesc;

            const newTags = prompt("Edit Tags (comma separated):", item.tags.join(', '));
            if (newTags !== null) item.tags = newTags.split(',').map(t => t.trim());

            const newRepo = prompt("Edit GitHub Repo URL:", item.repoUrl);
            if (newRepo !== null) item.repoUrl = newRepo;

            const newSnippet = prompt("Edit Code Snippet:", item.snippet);
            if (newSnippet !== null) item.snippet = newSnippet;

            this.render();
            return;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
