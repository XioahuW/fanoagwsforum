// GitHub 相关配置，你需要将下面的内容替换为你自己的 GitHub 仓库信息以及获取到的个人访问令牌（Personal Access Token）
const GITHUB_USERNAME = "XioahuW";
const GITHUB_REPO_NAME = "fanoagwsforum";
const GITHUB_ACCESS_TOKEN = "YOUR_PERSONAL_ACCESS_TOKEN";
const GITHUB_API_BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/contents/`;

// 页面加载时初始化，获取并展示帖子列表
window.addEventListener('load', function () {
    displayPosts();
});

// 获取帖子数据的函数，通过 GitHub API 从指定仓库的文件中读取内容（这里简单将帖子数据存为文件内容）
async function getPosts() {
    try {
        const response = await fetch(GITHUB_API_BASE_URL, {
            headers: {
                'Authorization': `token ${GITHUB_ACCESS_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        const posts = [];
        for (const file of data) {
            const fileResponse = await fetch(file.download_url, {
                headers: {
                    'Authorization': `token ${GITHUB_ACCESS_TOKEN}`
                }
            });
            const postContent = await fileResponse.text();
            const post = JSON.parse(postContent);
            posts.push(post);
        }
        return posts;
    } catch (error) {
        console.error("获取帖子数据出错：", error);
        return [];
    }
}

// 保存帖子数据到 GitHub 仓库的函数，将新帖子数据以文件形式保存到仓库
async function savePosts(posts) {
    try {
        for (const post of posts) {
            const fileName = `${Date.now()}-${post.title}.json`; // 以时间戳和标题命名文件
            const postContent = JSON.stringify(post);
            const response = await fetch(GITHUB_API_BASE_URL + fileName, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "添加新帖子",
                    content: btoa(postContent) // 将内容进行 base64 编码，符合 GitHub API 要求
                })
            });
            if (!response.ok) {
                console.error("保存帖子数据出错：", response.statusText);
            }
        }
    } catch (error) {
        console.error("保存帖子数据出错：", error);
    }
}

// 展示帖子列表到页面的函数
function displayPosts() {
    const postItems = document.getElementById('post-items');
    postItems.innerHTML = '';
    getPosts().then(posts => {
        posts.forEach(post => {
            const li = document.createElement('li');
            li.classList.add('post-item');
            li.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
            `;
            postItems.appendChild(li);
        });
    });
}

// 处理表单提交事件，添加新帖子
document.getElementById('post-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    if (title === '' || content === '') {
        alert('标题和内容不能为空，请填写完整后再提交。');
        return;
    }
    const posts = getPosts().then(existingPosts => {
        existingPosts.push({ title: title, content: content });
        return existingPosts;
    });
    posts.then(savedPosts => {
        savePosts(savedPosts);
        displayPosts();
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
    });
});
