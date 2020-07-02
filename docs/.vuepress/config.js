// 参考
// https://github.com/PanJiaChen/vue-element-admin-site/blob/master/docs/.vuepress/config.js

module.exports = {
    title: '运维工程师进阶之路', // 显示在左上角的网页名称以及首页在浏览器标签显示的title名称
    description: 'SRE', // meta 中的描述文字，用于SEO
    // 注入到当前页面的 HTML <head> 中的标签
    head: [
        ['link', { rel: 'icon', href: '/bookDog.png' }],  //浏览器的标签栏的网页图标
    ],
    markdown: {
        lineNumbers: true
    },
    serviceWorker: true,
    themeConfig: {
        logo: '/bookDog.png',
        lastUpdated: 'lastUpdate', // string | boolean
        nav: [
            { text: '首页', link: '/' },
            {
                text: '分类',
                ariaLabel: '分类',
                items: [
                    { text: '文章', link: '/sre/linux/cli.md' },
                    { text: '琐碎', link: '/sre/mysql/install.md' },
                ]
            },
            { text: '功能演示', link: '/sre/linux/cli.md' },
            { text: 'Github', link: 'https://github.com/yes5144' },
        ],
        sidebar: {
            '/sre/': [
                {
                    title: 'linux',   // 必要的
                    collapsable: true, // 可选的, 默认值是 true,
                    sidebarDepth: 1,    // 可选的, 默认值是 1
                    children: [
                        ['linux/base_cli.md', '基础命令'],
                        ['linux/cli.md', '常用命令']
                    ]
                },
                {
                    title: 'nginx',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['nginx/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'mysql',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['mysql/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'gitlab',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['gitlab/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'jenkins',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['jenkins/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'redis',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['redis/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'saltstack',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['saltstack/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'zabbix',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['zabbix/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'prometheus',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['prometheus/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'python',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['python/base.md', '数据类型和操作'],
                        ['python/django.md', 'django入门'],
                    ]
                },
                {
                    title: 'docker',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['docker/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'k8s',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['k8s/install.md', 'mysql安装']
                    ]
                },
                {
                    title: 'golang',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['golang/install.md']
                    ]
                },
                {
                    title: '小技巧',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['tips/echoColorful.md', 'echo加点颜色'],
                        ['tips/timeFormat.md', 'time格式化字符串'],
                        ['tips/top10.md', 'top排行榜'],
                    ]
                }
            ],
        }
    }
}

