# 怎么使用
1. `bundle exec jekyll serve`

# 怎么修改
1. 侧边栏News内容修改：`_includes\author-profile.html`
2. 侧边栏基本信息修改：`_config.yml`
3. 主页内容修改：`_pages\about.md`
4. 主页布局修改（markdown内容布局）：`_sass\_page.scss`
5. 博客内容：`_posts`
6. 博客布局：`_sass\_archive.scss`
7. 开源代码内容修改：`_pages\github.md`
8. 上边栏内容：`_data\navigation.yml`

# TODO
- [x] 调整上边栏间距: `_sass\_masthead.scss`
- [x] 手机端显示`Follow`按钮
- [ ] 防止侧边栏在缩小时出现上下滑块
  - [x] 通过调整`_sass_sidebar.css`在特定大小时隐藏侧边栏新闻，简单实现防止上下滑块的出现
- [x] 博客阅读时间统计方式
  - [x] 博客阅读时间内外不同bug
- [x] 调整博客列表间距
- [ ] 手机关注偏移bug修复
- [ ] 左侧边栏可以左右平移bug