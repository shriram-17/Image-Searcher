const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const uploadForm = document.getElementById('uploadForm');
const urlForm = document.getElementById('urlForm');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const imageUrl = document.getElementById('imageUrl');
const urlPreviewContainer = document.getElementById('urlPreviewContainer');
const urlPreviewImage = document.getElementById('urlPreviewImage');

function switchTab(tab) {
    const uploadBtn = document.getElementById('uploadTabBtn');
    const urlBtn = document.getElementById('urlTabBtn');
    const uploadTab = document.getElementById('uploadTab');
    const urlTab = document.getElementById('urlTab');

    if (tab === 'upload') {
        uploadBtn.className = 'flex-1 py-4 px-8 text-center font-bold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl transition-all duration-300 hover:shadow-purple-500/50 hover:scale-[1.02]';
        urlBtn.className = 'flex-1 py-4 px-8 text-center font-bold rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300';
        uploadTab.classList.remove('hidden');
        urlTab.classList.add('hidden');
    } else {
        urlBtn.className = 'flex-1 py-4 px-8 text-center font-bold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl transition-all duration-300 hover:shadow-purple-500/50 hover:scale-[1.02]';
        uploadBtn.className = 'flex-1 py-4 px-8 text-center font-bold rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300';
        urlTab.classList.remove('hidden');
        uploadTab.classList.add('hidden');
    }

    result.innerHTML = '';
}

// URL preview
imageUrl.addEventListener('input', (e) => {
    const url = e.target.value;
    if (url) {
        urlPreviewImage.src = url;
        urlPreviewContainer.classList.remove('hidden');
        urlPreviewImage.onerror = () => {
            urlPreviewContainer.classList.add('hidden');
        };
    } else {
        urlPreviewContainer.classList.add('hidden');
    }
});

// Upload area interactions
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgb(168, 85, 247)';
    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        previewFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        previewFile(e.target.files[0]);
    }
});

function previewFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Upload form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('prompt', document.getElementById('uploadPrompt').value);
    formData.append('model', document.getElementById('uploadModel').value);

    document.getElementById('uploadBtn').disabled = true;
    loading.classList.remove('hidden');
    result.innerHTML = '';

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            result.innerHTML = `
                <div class="mt-10 p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/30 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <span class="text-2xl">✨</span>
                            </div>
                            <h3 class="text-2xl font-black text-white">Analysis Result</h3>
                        </div>
                        <div class="bg-slate-950/30 rounded-2xl p-6 mb-6">
                            <p class="text-gray-100 leading-relaxed text-lg whitespace-pre-wrap">${data.description}</p>
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <div class="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                                <span class="text-xl">🤖</span>
                                <span class="text-purple-300 font-semibold">${data.model_used}</span>
                            </div>
                            <div class="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-xl">
                                <span class="text-xl">⚡</span>
                                <span class="text-pink-300 font-semibold">${data.processing_time}s</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            result.innerHTML = `
                <div class="mt-10 p-8 bg-red-500/10 border-2 border-red-500/30 rounded-3xl">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <span class="text-3xl">❌</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-red-300 mb-1">Error</h3>
                            <p class="text-red-400">${data.error}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        result.innerHTML = `
            <div class="mt-10 p-8 bg-red-500/10 border-2 border-red-500/30 rounded-3xl">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <span class="text-3xl">❌</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-red-300 mb-1">Error</h3>
                        <p class="text-red-400">${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    } finally {
        document.getElementById('uploadBtn').disabled = false;
        loading.classList.add('hidden');
    }
});

// URL form submission
urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        image_url: imageUrl.value,
        prompt: document.getElementById('urlPrompt').value,
        model: document.getElementById('urlModel').value
    };

    document.getElementById('urlBtn').disabled = true;
    loading.classList.remove('hidden');
    result.innerHTML = '';

    try {
        const response = await fetch('/analyze-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (responseData.success) {
            result.innerHTML = `
                <div class="mt-10 p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/30 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <span class="text-2xl">✨</span>
                            </div>
                            <h3 class="text-2xl font-black text-white">Analysis Result</h3>
                        </div>
                        <div class="bg-slate-950/30 rounded-2xl p-6 mb-6">
                            <p class="text-gray-100 leading-relaxed text-lg whitespace-pre-wrap">${responseData.description}</p>
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <div class="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                                <span class="text-xl">🤖</span>
                                <span class="text-purple-300 font-semibold">${responseData.model_used}</span>
                            </div>
                            <div class="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-xl">
                                <span class="text-xl">⚡</span>
                                <span class="text-pink-300 font-semibold">${responseData.processing_time}s</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            result.innerHTML = `
                <div class="mt-10 p-8 bg-red-500/10 border-2 border-red-500/30 rounded-3xl">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <span class="text-3xl">❌</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-red-300 mb-1">Error</h3>
                            <p class="text-red-400">${responseData.error}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        result.innerHTML = `
            <div class="mt-10 p-8 bg-red-500/10 border-2 border-red-500/30 rounded-3xl">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <span class="text-3xl">❌</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-red-300 mb-1">Error</h3>
                        <p class="text-red-400">${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    } finally {
        document.getElementById('urlBtn').disabled = false;
        loading.classList.add('hidden');
    }
});
