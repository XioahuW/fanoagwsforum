// 用于存储当前选择的数据存储方式，默认为本地存储（'localStorage'），也可切换为'indexedDB'或'firebase'
let dataStorageMethod = 'localStorage';

// 初始化Firebase配置（需替换为你自己的真实配置信息）
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 页面加载时执行的函数，用于初始化页面，比如加载已有的帖子数据
window.addEventListener('load', function () {
    displayPosts();
});

// 根据选择的数据存储方式获取帖子数据
function getPosts() {
    if (dataStorageMethod === 'localStorage') {
        return JSON.parse(localStorage.getItem('posts')) || [];
    } else if (dataStorageMethod === 'indexedDB') {
        return readFromIndexedDB();
    } else if (dataStorageMethod === 'firebase') {
        return readFromFirebase();
    }
}

// 根据选择的数据存储方式存储新帖子数据
function savePosts(posts) {
    if (dataStorageMethod === 'localStorage') {
        localStorage.setItem('posts', JSON.stringify(posts));
    } else if (dataStorageMethod === 'indexedDB') {
        writeToIndexedDB(posts);
    } else if (dataStorageMethod === 'firebase') {
        writeToFirebase(posts);
    }
}

// 向页面展示帖子列表
function displayPosts() {
    const postItems = document.getElementById('post-items');
    postItems.innerHTML = '';
    const posts = getPosts();
    posts.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <span>作者：匿名</span>
        `;
        postItems.appendChild(li);
    });
}

// 处理表单提交事件
document.getElementById('post-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    if (title === '' || content === '') {
        alert('标题和内容不能为空，请填写完整后再提交。');
        return;
    }
    const posts = getPosts();
    posts.push({ title: title, content: content });
    savePosts(posts);
    // 清空表单输入框
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    displayPosts();
});

// 使用本地存储相关操作

// 从本地存储读取数据（前面已有部分调用，此处完整展示函数）
function readFromLocalStorage() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

// 使用IndexedDB相关操作

// 打开IndexedDB数据库
const indexedDBRequest = indexedDB.open('forumDB', 1);
indexedDBRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
};

// 从IndexedDB读取数据
function readFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const posts = [];
        const transaction = indexedDBRequest.result.transaction(['posts'], 'readonly');
        const objectStore = transaction.objectStore('posts');
        const cursorRequest = objectStore.openCursor();
        cursorRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                posts.push(cursor.value);
                cursor.continue();
            } else {
                resolve(posts);
            }
        };
        cursorRequest.onerror = function () {
            reject('读取IndexedDB数据出错');
        };
    });
}

// 向IndexedDB写入数据
function writeToIndexedDB(posts) {
    return new Promise((resolve, reject) => {
        const transaction = indexedDBRequest.result.transaction(['posts'], 'readwrite');
        const objectStore = transaction.objectStore('posts');
        posts.forEach(post => {
            const request = objectStore.add(post);
            request.onsuccess = function () {
                console.log('向IndexedDB添加数据成功');
            };
            request.onerror = function () {
                reject('向IndexedDB添加数据出错');
            };
        });
        transaction.oncomplete = function () {
            resolve();
        };
    });
}

// 使用Firebase相关操作

// 从Firebase读取数据
function readFromFirebase() {
    return new Promise((resolve, reject) => {
        const posts = [];
        database.ref('posts').once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                posts.push(childSnapshot.val());
            });
            resolve(posts);
        }).catch(error => {
            reject(error);
        });
    });
}

// 向Firebase写入数据
function writeToFirebase(posts) {
    const newPostsRef = database.ref('posts');
    posts.forEach(post => {
        newPostsRef.push(post);
    });
}
