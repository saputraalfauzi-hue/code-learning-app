class LearningApp {
    constructor() {
        this.apiKey = "AIzaSyB9y8j0FKW98Fj7LBQzLrOaG8Rk9EXcAro";
        this.apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
        this.userData = this.loadUserData();
        this.currentExercise = null;
        this.chart = null;
        
        this.init();
    }
    
    init() {
        this.checkLogin();
        this.setupEventListeners();
        this.loadExercises();
        this.loadSyllabus();
        this.updateDashboard();
        this.updateProgressCircle();
        this.setupChart();
        this.testApiConnection();
    }
    
    loadUserData() {
        const defaultData = {
            username: "",
            exercises: {},
            syllabus: {},
            chatHistory: [],
            progress: {
                totalStudyTime: 0,
                completedExercises: 0,
                completedTopics: 0,
                aiQuestions: 0,
                weeklyProgress: {}
            },
            recentActivity: []
        };
        
        const savedData = localStorage.getItem('learningAppData');
        return savedData ? JSON.parse(savedData) : defaultData;
    }
    
    saveUserData() {
        localStorage.setItem('learningAppData', JSON.stringify(this.userData));
    }
    
    checkLogin() {
        if (!this.userData.username) {
            this.showLoginModal();
        } else {
            document.getElementById('username').textContent = this.userData.username;
        }
    }
    
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.classList.add('active');
        
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username-input').value.trim();
            if (username) {
                this.userData.username = username;
                document.getElementById('username').textContent = username;
                this.saveUserData();
                modal.classList.remove('active');
                this.addActivity(`Pengguna "${username}" masuk ke aplikasi`);
            }
        });
    }
    
    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.showSection(section);
                
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        document.querySelectorAll('.card-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelector(`.nav-item[data-section="${section}"]`).classList.add('active');
            });
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.userData.username = "";
            this.saveUserData();
            this.checkLogin();
        });
        
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        
        document.getElementById('user-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                document.getElementById('user-input').value = question;
                this.sendMessage();
            });
        });
        
        document.getElementById('difficulty-filter').addEventListener('change', () => this.loadExercises());
        document.getElementById('status-filter').addEventListener('change', () => this.loadExercises());
        
        document.getElementById('search-reference').addEventListener('input', () => this.filterReferences());
        document.getElementById('reference-category').addEventListener('change', () => this.filterReferences());
        
        document.getElementById('reset-syllabus').addEventListener('click', () => this.resetSyllabus());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('reset-progress').addEventListener('click', () => this.resetProgress());
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
            });
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.getElementById(sectionId).classList.add('active');
        
        if (sectionId === 'progres') {
            this.updateProgressChart();
        }
    }
    
    loadExercises() {
        const container = document.getElementById('exercises-container');
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        container.innerHTML = '<div class="loading">Memuat latihan...</div>';
        
        const exercises = this.getExercisesData();
        
        setTimeout(() => {
            let filteredExercises = exercises;
            
            if (difficultyFilter !== 'all') {
                filteredExercises = filteredExercises.filter(ex => ex.difficulty === difficultyFilter);
            }
            
            if (statusFilter !== 'all') {
                filteredExercises = filteredExercises.filter(ex => {
                    const status = this.userData.exercises[ex.id]?.status || 'not-started';
                    return status === statusFilter;
                });
            }
            
            if (filteredExercises.length === 0) {
                container.innerHTML = '<div class="no-data">Tidak ada latihan yang sesuai dengan filter.</div>';
                return;
            }
            
            container.innerHTML = '';
            
            filteredExercises.forEach(exercise => {
                const status = this.userData.exercises[exercise.id]?.status || 'not-started';
                const progress = this.userData.exercises[exercise.id]?.progress || 0;
                
                const card = document.createElement('div');
                card.className = 'exercise-card';
                card.innerHTML = `
                    <div class="exercise-header">
                        <div>
                            <h4 class="exercise-title">${exercise.title}</h4>
                            <div class="difficulty ${exercise.difficulty}">${this.capitalizeFirstLetter(exercise.difficulty)}</div>
                        </div>
                        <div class="status ${status.replace('-', '')}">${this.getStatusText(status)}</div>
                    </div>
                    <p class="exercise-description">${exercise.description}</p>
                    <div class="exercise-footer">
                        <div class="exercise-meta">
                            <span><i class="far fa-clock"></i> ${exercise.duration} menit</span>
                            <span><i class="far fa-question-circle"></i> ${exercise.questions} soal</span>
                        </div>
                        <button class="btn-primary start-exercise-btn" data-id="${exercise.id}">${status === 'completed' ? 'Lihat' : 'Mulai'}</button>
                    </div>
                    ${status !== 'not-started' ? `<div class="progress-bar-container"><div class="progress-bar" style="width: ${status === 'completed' ? 100 : progress}%"></div></div>` : ''}
                `;
                
                container.appendChild(card);
            });
            
            document.querySelectorAll('.start-exercise-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const exerciseId = e.target.getAttribute('data-id');
                    this.openExerciseModal(exerciseId);
                });
            });
        }, 300);
    }
    
    getExercisesData() {
        return [
            {
                id: 'html-basic',
                title: 'HTML Dasar',
                description: 'Latihan membuat struktur HTML dasar dengan tag-tag penting.',
                difficulty: 'easy',
                duration: 15,
                questions: 5,
                content: `
                    <h4>Latihan HTML Dasar</h4>
                    <p>Buatlah struktur HTML dasar yang berisi:</p>
                    <ol>
                        <li>Dokumen HTML5 dengan deklarasi DOCTYPE yang benar</li>
                        <li>Elemen &lt;html&gt; dengan atribut lang="id"</li>
                        <li>Head yang berisi judul "Belajar HTML"</li>
                        <li>Body yang berisi:
                            <ul>
                                <li>Heading level 1 dengan teks "Selamat Datang"</li>
                                <li>Paragraf dengan teks "Ini adalah halaman web pertama saya"</li>
                                <li>Gambar dengan sumber "logo.png" dan teks alternatif "Logo"</li>
                            </ul>
                        </li>
                    </ol>
                    <div class="code-editor">
                        <textarea id="html-code" placeholder="Ketik kode HTML Anda di sini..." rows="10"></textarea>
                    </div>
                `
            },
            {
                id: 'css-layout',
                title: 'Layout dengan CSS Flexbox',
                description: 'Membuat layout responsif menggunakan CSS Flexbox.',
                difficulty: 'medium',
                duration: 25,
                questions: 3,
                content: `
                    <h4>Latihan CSS Flexbox</h4>
                    <p>Buatlah layout berikut menggunakan CSS Flexbox:</p>
                    <ul>
                        <li>Container dengan 3 kolom yang memiliki spacing yang sama</li>
                        <li>Setiap kolom memiliki tinggi minimal 200px</li>
                        <li>Kolom pertama berwarna merah, kedua hijau, ketiga biru</li>
                        <li>Pada layar kecil (mobile), kolom menjadi vertikal</li>
                    </ul>
                    <div class="code-editor">
                        <textarea id="css-code" placeholder="Ketik kode CSS Anda di sini..." rows="10"></textarea>
                    </div>
                `
            },
            {
                id: 'js-functions',
                title: 'Fungsi JavaScript',
                description: 'Latihan membuat dan menggunakan fungsi di JavaScript.',
                difficulty: 'medium',
                duration: 30,
                questions: 4,
                content: `
                    <h4>Latihan Fungsi JavaScript</h4>
                    <p>Buatlah fungsi-fungsi berikut:</p>
                    <ol>
                        <li>Fungsi yang menerima dua parameter angka dan mengembalikan penjumlahannya</li>
                        <li>Fungsi yang menerima array angka dan mengembalikan nilai tertinggi</li>
                        <li>Fungsi yang menerima string dan mengembalikan string tersebut dalam bentuk kapital</li>
                        <li>Fungsi rekursif untuk menghitung faktorial</li>
                    </ol>
                    <div class="code-editor">
                        <textarea id="js-code" placeholder="Ketik kode JavaScript Anda di sini..." rows="10"></textarea>
                    </div>
                `
            },
            {
                id: 'responsive-design',
                title: 'Desain Web Responsif',
                description: 'Membuat halaman web yang responsif untuk berbagai perangkat.',
                difficulty: 'hard',
                duration: 45,
                questions: 6,
                content: `
                    <h4>Latihan Desain Responsif</h4>
                    <p>Buatlah halaman web responsif dengan kriteria:</p>
                    <ul>
                        <li>Header dengan navigasi yang berubah menjadi menu hamburger di mobile</li>
                        <li>Grid layout dengan 4 kolom di desktop, 2 kolom di tablet, 1 kolom di mobile</li>
                        <li>Gambar yang menyesuaikan ukuran berdasarkan lebar layar</li>
                        <li>Typography yang scalable menggunakan unit rem</li>
                        <li>Breakpoints di 768px dan 1024px</li>
                    </ul>
                    <div class="code-editor">
                        <textarea id="responsive-code" placeholder="Ketik kode HTML/CSS Anda di sini..." rows="12"></textarea>
                    </div>
                `
            }
        ];
    }
    
    openExerciseModal(exerciseId) {
        const exercise = this.getExercisesData().find(ex => ex.id === exerciseId);
        if (!exercise) return;
        
        this.currentExercise = exercise;
        
        const modal = document.getElementById('exercise-modal');
        const title = document.getElementById('exercise-modal-title');
        const content = document.getElementById('exercise-modal-content');
        const startBtn = document.getElementById('start-exercise');
        const submitBtn = document.getElementById('submit-exercise');
        const markCompleteBtn = document.getElementById('mark-complete');
        
        title.textContent = exercise.title;
        content.innerHTML = exercise.content;
        
        const status = this.userData.exercises[exerciseId]?.status || 'not-started';
        
        if (status === 'not-started') {
            startBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
            markCompleteBtn.style.display = 'none';
        } else if (status === 'in-progress') {
            startBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
            markCompleteBtn.style.display = 'inline-flex';
        } else {
            startBtn.style.display = 'none';
            submitBtn.style.display = 'none';
            markCompleteBtn.style.display = 'inline-flex';
            markCompleteBtn.textContent = 'Latihan Selesai';
            markCompleteBtn.disabled = true;
        }
        
        modal.classList.add('active');
        
        startBtn.onclick = () => {
            this.startExercise(exerciseId);
            startBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
            markCompleteBtn.style.display = 'inline-flex';
        };
        
        submitBtn.onclick = () => {
            this.submitExercise(exerciseId);
        };
        
        markCompleteBtn.onclick = () => {
            this.completeExercise(exerciseId);
            modal.classList.remove('active');
            this.loadExercises();
            this.updateDashboard();
            this.updateProgressCircle();
        };
    }
    
    startExercise(exerciseId) {
        if (!this.userData.exercises[exerciseId]) {
            this.userData.exercises[exerciseId] = {
                status: 'in-progress',
                progress: 0,
                startedAt: new Date().toISOString()
            };
            
            this.addActivity(`Memulai latihan "${this.getExerciseTitle(exerciseId)}"`);
            this.saveUserData();
        }
    }
    
    submitExercise(exerciseId) {
        if (this.userData.exercises[exerciseId]) {
            this.userData.exercises[exerciseId].progress = 100;
            this.userData.exercises[exerciseId].submittedAt = new Date().toISOString();
            
            this.addActivity(`Mengirim jawaban untuk latihan "${this.getExerciseTitle(exerciseId)}"`);
            this.saveUserData();
            
            document.getElementById('submit-exercise').style.display = 'none';
            document.getElementById('mark-complete').textContent = 'Tandai Selesai';
        }
    }
    
    completeExercise(exerciseId) {
        if (this.userData.exercises[exerciseId]) {
            this.userData.exercises[exerciseId].status = 'completed';
            this.userData.exercises[exerciseId].completedAt = new Date().toISOString();
            this.userData.progress.completedExercises++;
            
            this.updateWeeklyProgress();
            this.addActivity(`Menyelesaikan latihan "${this.getExerciseTitle(exerciseId)}"`);
            this.saveUserData();
        }
    }
    
    getExerciseTitle(exerciseId) {
        const exercise = this.getExercisesData().find(ex => ex.id === exerciseId);
        return exercise ? exercise.title : 'Latihan';
    }
    
    loadSyllabus() {
        const container = document.getElementById('syllabus-container');
        
        container.innerHTML = '<div class="loading">Memuat syllabus...</div>';
        
        setTimeout(() => {
            const syllabus = this.getSyllabusData();
            
            container.innerHTML = '';
            
            syllabus.forEach(topic => {
                const status = this.userData.syllabus[topic.id]?.status || 'not-started';
                const progress = this.userData.syllabus[topic.id]?.progress || 0;
                
                const card = document.createElement('div');
                card.className = 'topic-card';
                card.innerHTML = `
                    <div class="topic-header">
                        <div>
                            <h4 class="topic-title">${topic.title}</h4>
                            <div class="topic-category">${topic.category}</div>
                        </div>
                        <div class="status ${status.replace('-', '')}">${this.getStatusText(status)}</div>
                    </div>
                    <p class="topic-description">${topic.description}</p>
                    <div class="topic-footer">
                        <div class="topic-meta">
                            <span><i class="far fa-clock"></i> ${topic.duration} jam</span>
                            <span><i class="fas fa-book"></i> ${topic.lessons} pelajaran</span>
                        </div>
                        <div class="topic-actions">
                            <button class="btn-secondary mark-topic-btn" data-id="${topic.id}" data-action="start">${status === 'not-started' ? 'Mulai' : 'Lanjutkan'}</button>
                            ${status === 'in-progress' ? '<button class="btn-success mark-topic-btn" data-id="' + topic.id + '" data-action="complete">Selesai</button>' : ''}
                        </div>
                    </div>
                    ${status !== 'not-started' ? `<div class="progress-bar-container"><div class="progress-bar" style="width: ${status === 'completed' ? 100 : progress}%"></div></div>` : ''}
                `;
                
                container.appendChild(card);
            });
            
            document.querySelectorAll('.mark-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const topicId = e.target.getAttribute('data-id');
                    const action = e.target.getAttribute('data-action');
                    
                    if (action === 'start') {
                        this.startTopic(topicId);
                    } else if (action === 'complete') {
                        this.completeTopic(topicId);
                    }
                    
                    this.loadSyllabus();
                    this.updateDashboard();
                    this.updateProgressCircle();
                });
            });
        }, 300);
    }
    
    getSyllabusData() {
        return [
            {
                id: 'html-fundamentals',
                title: 'Dasar-dasar HTML',
                description: 'Pelajari struktur dasar HTML, tag, elemen, dan atribut.',
                category: 'HTML',
                duration: 8,
                lessons: 6
            },
            {
                id: 'css-styling',
                title: 'Styling dengan CSS',
                description: 'Pelajari selektor CSS, properti styling, box model, dan layout dasar.',
                category: 'CSS',
                duration: 10,
                lessons: 8
            },
            {
                id: 'css-advanced',
                title: 'CSS Lanjutan',
                description: 'Flexbox, Grid, animasi, dan responsive design.',
                category: 'CSS',
                duration: 12,
                lessons: 10
            },
            {
                id: 'javascript-basics',
                title: 'JavaScript Dasar',
                description: 'Variabel, tipe data, operator, dan struktur kontrol.',
                category: 'JavaScript',
                duration: 15,
                lessons: 12
            },
            {
                id: 'javascript-dom',
                title: 'JavaScript dan DOM',
                description: 'Memanipulasi elemen HTML, event handling, dan form validation.',
                category: 'JavaScript',
                duration: 12,
                lessons: 10
            },
            {
                id: 'web-apis',
                title: 'Web APIs',
                description: 'Fetch API, localStorage, dan API browser lainnya.',
                category: 'JavaScript',
                duration: 10,
                lessons: 8
            }
        ];
    }
    
    startTopic(topicId) {
        if (!this.userData.syllabus[topicId]) {
            this.userData.syllabus[topicId] = {
                status: 'in-progress',
                progress: 30,
                startedAt: new Date().toISOString()
            };
            
            this.addActivity(`Memulai materi "${this.getTopicTitle(topicId)}"`);
            this.saveUserData();
        }
    }
    
    completeTopic(topicId) {
        if (this.userData.syllabus[topicId]) {
            this.userData.syllabus[topicId].status = 'completed';
            this.userData.syllabus[topicId].progress = 100;
            this.userData.syllabus[topicId].completedAt = new Date().toISOString();
            this.userData.progress.completedTopics++;
            
            this.updateWeeklyProgress();
            this.addActivity(`Menyelesaikan materi "${this.getTopicTitle(topicId)}"`);
            this.saveUserData();
        }
    }
    
    getTopicTitle(topicId) {
        const topic = this.getSyllabusData().find(t => t.id === topicId);
        return topic ? topic.title : 'Topik';
    }
    
    updateDashboard() {
        const completedExercises = Object.values(this.userData.exercises).filter(ex => ex.status === 'completed').length;
        const completedTopics = Object.values(this.userData.syllabus).filter(topic => topic.status === 'completed').length;
        
        const totalExercises = this.getExercisesData().length;
        const totalTopics = this.getSyllabusData().length;
        
        const exerciseProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
        const topicProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
        const overallProgress = Math.round((exerciseProgress + topicProgress) / 2);
        
        document.getElementById('completed-exercises').textContent = `${completedExercises} dari ${totalExercises}`;
        document.getElementById('completed-topics').textContent = `${completedTopics} dari ${totalTopics}`;
        document.getElementById('overall-progress').textContent = `${overallProgress}%`;
        document.getElementById('ai-questions').textContent = this.userData.progress.aiQuestions;
        
        this.updateRecentActivity();
    }
    
    updateRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        
        if (this.userData.recentActivity.length === 0) {
            container.innerHTML = '<li>Belum ada aktivitas</li>';
            return;
        }
        
        container.innerHTML = '';
        
        const recentActivities = this.userData.recentActivity.slice(-5).reverse();
        
        recentActivities.forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="far fa-clock"></i> ${activity}`;
            container.appendChild(li);
        });
    }
    
    addActivity(activity) {
        const timestamp = new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        this.userData.recentActivity.push(`${timestamp} - ${activity}`);
        
        if (this.userData.recentActivity.length > 20) {
            this.userData.recentActivity = this.userData.recentActivity.slice(-20);
        }
        
        this.saveUserData();
    }
    
    updateProgressCircle() {
        const totalExercises = this.getExercisesData().length;
        const totalTopics = this.getSyllabusData().length;
        
        const completedExercises = Object.values(this.userData.exercises).filter(ex => ex.status === 'completed').length;
        const completedTopics = Object.values(this.userData.syllabus).filter(topic => topic.status === 'completed').length;
        
        const exerciseProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
        const topicProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
        const overallProgress = Math.round((exerciseProgress + topicProgress) / 2);
        
        const circle = document.getElementById('progress-circle');
        const percentText = document.getElementById('progress-percent');
        
        const circumference = 2 * Math.PI * 25;
        const offset = circumference - (overallProgress / 100) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
        
        percentText.textContent = `${overallProgress}%`;
    }
    
    async sendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();
        
        if (!message) return;
        
        this.addMessage('user', message);
        userInput.value = '';
        
        this.userData.progress.aiQuestions++;
        this.saveUserData();
        this.updateDashboard();
        
        this.addMessage('ai', 'Memikirkan jawaban...', true);
        
        try {
            const response = await this.getAIResponse(message);
            this.updateLastMessage(response);
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.updateLastMessage('Maaf, terjadi kesalahan saat menghubungi AI. Pastikan API key valid dan koneksi internet tersedia.');
        }
    }
    
    async getAIResponse(message) {
        const url = `${this.apiBaseUrl}?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `Anda adalah asisten AI untuk belajar pemrograman web. Berikan jawaban yang jelas, edukatif, dan ramah untuk pertanyaan tentang HTML, CSS, JavaScript, dan teknologi web lainnya. Pertanyaan: ${message}`
                }]
            }]
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return 'Maaf, saya tidak dapat menghasilkan jawaban saat ini.';
        }
    }
    
    addMessage(sender, text, isThinking = false) {
        const container = document.getElementById('chat-messages');
        const time = new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'ai' ? 'robot' : 'user-circle'}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender">${sender === 'ai' ? 'Asisten AI' : this.userData.username || 'Anda'}</span>
                    <span class="time">${time}</span>
                </div>
                <p>${isThinking ? '<i class="fas fa-spinner fa-spin"></i> ' + text : text}</p>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        if (isThinking) {
            messageDiv.id = 'thinking-message';
        }
    }
    
    updateLastMessage(text) {
        const thinkingMessage = document.getElementById('thinking-message');
        if (thinkingMessage) {
            thinkingMessage.querySelector('p').innerHTML = marked.parse(text);
            thinkingMessage.removeAttribute('id');
        }
    }
    
    async testApiConnection() {
        const statusIndicator = document.getElementById('api-status');
        const statusText = document.getElementById('api-status-text');
        
        try {
            const response = await this.getAIResponse('Halo');
            statusIndicator.className = 'status-indicator connected';
            statusText.textContent = 'AI Terhubung';
        } catch (error) {
            console.error('API connection test failed:', error);
            statusIndicator.className = 'status-indicator';
            statusText.textContent = 'AI Tidak Terhubung';
        }
    }
    
    filterReferences() {
        const searchTerm = document.getElementById('search-reference').value.toLowerCase();
        const category = document.getElementById('reference-category').value;
        
        document.querySelectorAll('.reference-item').forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const title = item.querySelector('h4').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = category === 'all' || itemCategory === category;
            
            if (matchesSearch && matchesCategory) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    setupChart() {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
                datasets: [{
                    label: 'Progres Belajar (%)',
                    data: [0, 0, 0, 0],
                    borderColor: '#4fc3a1',
                    backgroundColor: 'rgba(79, 195, 161, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Progres Belajar 4 Minggu Terakhir'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    updateProgressChart() {
        const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
        const weeklyData = [0, 0, 0, 0];
        
        const weeklyProgress = this.userData.progress.weeklyProgress;
        const weekKeys = Object.keys(weeklyProgress).sort().slice(-4);
        
        weekKeys.forEach((weekKey, index) => {
            const weekIndex = weeks.length - weekKeys.length + index;
            if (weekIndex >= 0) {
                weeklyData[weekIndex] = weeklyProgress[weekKey];
            }
        });
        
        if (this.chart) {
            this.chart.data.datasets[0].data = weeklyData;
            this.chart.update();
        }
        
        this.updateWeekProgressDisplay();
        this.updateProgressStats();
    }
    
    updateWeekProgressDisplay() {
        const container = document.getElementById('week-progress-container');
        const weeklyProgress = this.userData.progress.weeklyProgress;
        
        if (Object.keys(weeklyProgress).length === 0) {
            container.innerHTML = '<div class="no-data">Belum ada data progres mingguan.</div>';
            return;
        }
        
        container.innerHTML = '';
        
        const weekKeys = Object.keys(weeklyProgress).sort().slice(-6);
        
        weekKeys.forEach(weekKey => {
            const progress = weeklyProgress[weekKey];
            
            const weekDiv = document.createElement('div');
            weekDiv.className = 'week-progress';
            weekDiv.innerHTML = `
                <div class="week-label">${weekKey}</div>
                <div class="week-bar">
                    <div class="week-fill" style="width: ${progress}%"></div>
                </div>
                <div class="week-percent">${progress}%</div>
            `;
            
            container.appendChild(weekDiv);
        });
    }
    
    updateProgressStats() {
        document.getElementById('total-study-time').textContent = `${Math.floor(this.userData.progress.totalStudyTime / 60)} jam ${this.userData.progress.totalStudyTime % 60} menit`;
        document.getElementById('total-exercises-completed').textContent = this.userData.progress.completedExercises;
        document.getElementById('total-topics-completed').textContent = this.userData.progress.completedTopics;
        document.getElementById('total-ai-questions').textContent = this.userData.progress.aiQuestions;
    }
    
    updateWeeklyProgress() {
        const now = new Date();
        const weekNumber = `Minggu ${this.getWeekNumber(now)}`;
        
        const totalExercises = this.getExercisesData().length;
        const totalTopics = this.getSyllabusData().length;
        
        const completedExercises = Object.values(this.userData.exercises).filter(ex => ex.status === 'completed').length;
        const completedTopics = Object.values(this.userData.syllabus).filter(topic => topic.status === 'completed').length;
        
        const exerciseProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
        const topicProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
        const overallProgress = Math.round((exerciseProgress + topicProgress) / 2);
        
        this.userData.progress.weeklyProgress[weekNumber] = overallProgress;
        this.userData.progress.totalStudyTime += 30;
        
        this.saveUserData();
    }
    
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    resetSyllabus() {
        if (confirm('Apakah Anda yakin ingin mereset progres syllabus? Tindakan ini tidak dapat dibatalkan.')) {
            this.userData.syllabus = {};
            this.userData.progress.completedTopics = 0;
            this.saveUserData();
            this.loadSyllabus();
            this.updateDashboard();
            this.updateProgressCircle();
            this.addActivity('Mer