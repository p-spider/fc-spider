/***
 * Puppeteer
 */

const fs = require('fs');
const log4js = require('log4js');
const cheerio = require('cheerio');
const request = require('request');
const Promise = require('bluebird');

const logger = log4js.getLogger();
logger.level = 'info';


class Spider {
	constructor() {
		this.header = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36'
		}
	}

	curl(url) {
		let reqConfig = {
			url: url,
			method: 'get',

		};
		return new Promise((resolve, reject) => {
			request(reqConfig, (err, res, body) => {
				if (err) {
					logger.error(`curl url err:${err}`);
					reject(err);
				}
				resolve(body);
			})
		})
	}


	download(fileName, filePath) {
		let reqConfig = {
			url: filePath,
			method: 'get',
			header: this.header
		};
		let stream = fs.createWriteStream('./video/' + fileName);
		return new Promise((resolve, reject) => {
			request(reqConfig)
				.on('error', (err) => {
					logger.error(`wget file err: ${err}`);
					reject(err)
				})
				.pipe(stream)
				.on('close', () => {
					resolve(void(0))
				});
		})
	}

	async batchDownload(taskList) {
		return Promise.map(taskList, (task) => {
			return this.download(task.name, task.src)
		}, {concurrency: taskList.length})
	}


	parseListPage(html) {
		try {
			let $ = cheerio.load(html);
			let listElement = $('#list_videos_common_videos_list_items .item  a');

			return (Array.from(listElement)).map((ele) => {
				return $(ele).attr('href')
			});

		} catch (err) {
			logger.error(err);
			throw new Error(err)
		}
	}


	parseVideoPage(html) {
		try {
			let $ = cheerio.load(html);
			let nameElement = $('.block-details .info .item em');
			let srcElement = $('.block-details .info .item a[data-attach-session]');

			let name = $(nameElement).text();
			let src = $(srcElement).attr('href');

			return {name, src}
		} catch (err) {
			logger.error(err);
			throw new Error(err)
		}
	}


	async run() {
		for (let i = 1; i < 1000; i++) {
			let url = `http://www.fcw42.com/most-popular/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=video_viewed&_=${(new Date()).valueOf()}&from=${i}`;
			let listPage = await this.curl(url);
			let urlList = this.parseListPage(listPage);

			logger.info(urlList)


			let taskList = [];
			for (let _url of urlList) {
				let html = await this.curl(_url);
				let {name, src} = this.parseVideoPage(html);
				logger.info(`find video name:${name}`);
				if (src) {
					taskList.push({name, src});
				}
			}

			for (let task of taskList) {
				logger.info(`start batch download videos:${task.name} | ${task.src}`);
			}
			// await this.batchDownload(taskList);
		}
	}
}

let spider = new Spider();
spider.run();

