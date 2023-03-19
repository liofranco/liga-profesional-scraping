import * as cheerio from "cheerio";
import axios from "axios";

const homeInfo = (req, res) => {
    axios.get(`https://www.ligaprofesional.ar/`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const mainLeftLink = $('.mvp-body-sec-wrap #mvp-feat3-wrap .mvp-feat3-left a').attr('href')
            const mainLeftImg = $('.mvp-body-sec-wrap #mvp-feat3-wrap .mvp-feat3-left a .mvp-feat3-main-img img').attr('src')
            const mainLeftTextCat = $('.mvp-body-sec-wrap #mvp-feat3-wrap .mvp-feat3-left a .mvp-feat3-main-text h3 span').text()
            const mainLeftTextTitle = $('.mvp-body-sec-wrap #mvp-feat3-wrap .mvp-feat3-left a .mvp-feat3-main-text h2').text()
            const mainLeftTextSubtitle = $('.mvp-body-sec-wrap #mvp-feat3-wrap .mvp-feat3-left a .mvp-feat3-main-text p').text()

            res.send({
                status: "success",
                main: {
                    title: mainLeftTextTitle,
                    subtitle: mainLeftTextSubtitle,
                    tag: mainLeftTextCat,
                    link: mainLeftLink,
                    img: mainLeftImg
                }
            })

        }).catch(err => console.error(err))
}

const newsData = (req, res) => {
    axios.get(`https://www.ligaprofesional.ar/noticias`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const main = $('.mvp-main-body-blog .mvp-main-blog-wrap .mvp-blog-story-wrap')

            let news = []
            main.each((i, el) => {
                const link = $(el).find('a').attr('href')
                const img = $(el).find('a .mvp-blog-story-img img').attr('src')
                const tag = $(el).find('.mvp-blog-story-text .mvp-post-info-top h3 a').text()
                const title = $(el).find('.mvp-blog-story-text h2 a').text()
                const subtitle = $(el).find('.mvp-blog-story-text p').text()
                news.push({
                    title,
                    subtitle,
                    tag,
                    link,
                    img
                })
            })

            res.send({
                status: "success",
                news
            })

        }).catch(err => console.error(err))
}

const postData = (req, res) => {
    let section = req.params.section
    let year = req.params.year
    let month = req.params.month
    let day = req.params.day
    let post = req.params.post
    axios.get(`https://www.ligaprofesional.ar/notas/${section}/${year}/${month}/${day}/${post}`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const title = $('#mvp-article-head .mvp-post-title').text()
            const subtitle = $('#mvp-article-head span p').text()
            const category = $('.mvp-post-cat .mvp-post-cat-link span').text()
            const image = $('#mvp-content-main #mvp-post-feat-img img').attr('src')
            const text = $('#mvp-content-main .theiaPostSlider_slides .theiaPostSlider_preloadedSlide p')

            let post = []

            text.each((i,el) => {
                const text = $(el).html()
                post.push({
                    text: text,
                })
            })

            res.send({
                status: "success",
                title: title,
                subtitle: subtitle,
                image: image,
                category: category,
                post
            })

        }).catch(err => console.error(err))
}

export { homeInfo, newsData, postData }