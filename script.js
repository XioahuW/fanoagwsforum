// 模拟存储帖子数据的数组（实际应用中会使用数据库存储）
let posts = [];

// 函数用于渲染帖子列表
function renderPostList() {
    const postListDiv = document.getElementById('post-list');
    postListDiv.innerHTML = ''; // 先清空列表内容
    posts.forEach((post, index) => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');

        const title = document.createElement('h3');
        title.textContent = post.title;

        const content = document.createElement('p');
        content.textContent = post.content;

        const replyButton = document.createElement('button');
        replyButton.textContent = '回复';
        replyButton.addEventListener('click', function () {
            showReplyForm(index);
        });

        const replyListDiv = document.createElement('div');
        post.replies.forEach(reply => {
            const replyP = document.createElement('p');
            replyP.textContent = reply;
            replyListDiv.appendChild(replyP);
        });

        postDiv.appendChild(title);
        postDiv.appendChild(content);
        postDiv.appendChild(replyButton);
        postDiv.appendChild(replyListDiv);

        postListDiv.appendChild(postDiv);
    });
}

// 函数用于显示回复帖子的表单，并关联对应的帖子
function showReplyForm(postIndex) {
    const replyForm = document.getElementById('reply-form');
    replyForm.style.display = 'block';
    replyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const replyContent = document.getElementById('reply-content').value;
        posts[postIndex].replies.push(replyContent);
        renderPostList();
        replyForm.reset();
        replyForm.style.display = 'none';
    });
}

// 处理发布新帖的表单提交事件
document.getElementById('post-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const newPost = {
        title: title,
        content: content,
        replies: []
    };
    posts.push(newPost);
    renderPostList();
    this.reset();
});

// 初始渲染帖子列表
renderPostList();
