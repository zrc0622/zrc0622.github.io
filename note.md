# 怎么使用
1. `bundle exec jekyll serve`

# 怎么修改
1. 侧边栏News内容修改：`_includes\author-profile.html`
2. 侧边栏基本信息修改：`_config.yml`
3. 主页内容修改：`_pages\about.md`
4. 主页布局修改：`_sass\_page.scss`
5. 博客内容：`_posts`
6. 博客布局：`_sass\_archive.scss`
7. 开源代码内容修改：`_pages\github.md`
8. 上边栏内容：`_data\navigation.yml`

# TODO
- [ ] 调整上边栏间距: `_sass\_masthead.scss`
- [ ] 手机端显示`Follow`按钮
- [ ] 防止侧边栏在缩小时出现上下滑块
  - [x] 通过调整`_sass_sidebar.css`隐藏侧边栏新闻简单实现