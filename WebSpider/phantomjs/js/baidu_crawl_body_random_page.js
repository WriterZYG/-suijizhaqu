var system = require('system');
var webPage = require('webpage');
var fs = require('fs');
var page = webPage.create();


if (system.args.length < 2) {
	console.log('the parameter is not right!');
	phantom.exit();
}
// 两个预读取参数
var crawl_para_file_path;
var crawl_para_json;

/*
 * 读取出命令行中crawl_para的json参数列表
 */
crawl_para_file_path = system.args[1];

// 将文件中的字符串转换成JSON对象
function getJsonObjByFile(filePath) {
	var config_crawl = fs.read(filePath);
	var obj = JSON.parse(config_crawl);
	return obj;
}

var crawl_para_json;

try {
	crawl_para_json = getJsonObjByFile(crawl_para_file_path);
} catch (err) {
	// 遇到错误后直接退出
	console.log(err.message
			+ 'json file parser error,will jump the task,phantom will exit!');
	phantom.exit();
}

// 爬虫开始爬的起始路径
var root_url = crawl_para_json.root_url;
// user agent赋值
page.settings.userAgent = crawl_para_json.userAgent;
// 选择是否inject jquery
var is_inject_jquery = crawl_para_json.is_inject_jquery;
// jquery.js的路径
var jquery_path = crawl_para_json.jquery_path;
// 是否对抓取的页面进行capture与保存
var is_capture_pic = crawl_para_json.is_capture_pic;
// 图片要保存到的路径
var pic_capture_save_root_path = crawl_para_json.pic_capture_save_root_path;
// 图片文件的前缀名字
var pic_file_prefix_name = crawl_para_json.pic_file_prefix_name;
// 图片文件的后缀名字
var pic_file_suffix_name = crawl_para_json.pic_file_suffix_name;
// 每个关键字或url任务的指定自己的目录，是root目录的一级目录
var pic_capture_save_sub_path = crawl_para_json.pic_capture_save_sub_path;
// 要抓取的最大页数量
var max_page_number = crawl_para_json.max_page_number;
// 将抓取下的网页的内容写到文件中
var is_data_write_to_file = crawl_para_json.is_data_write_to_file;
// 写入目录的根文件目录
var data_write_to_file_root_path = crawl_para_json.data_write_to_file_root_path;
// 数据目录的前缀名字
var data_file_prefix_name = crawl_para_json.data_file_prefix_name;
// 数据目录的后缀名字
var data_file_suffix_name = crawl_para_json.data_file_suffix_name;
// 文本数据要保存的自己指定的文件目录
var data_write_to_file_sub_path = crawl_para_json.data_write_to_file_sub_path;
// 最长等待无反应时间，如果过了这个时间无反应，则将退出phantomjs或者重新打下某个页面,暂选择退出phantomjs
var no_response_waitting_time_max = crawl_para_json.no_response_waitting_time_max;
// 最多可以重复‘等待超过最长时间’的次数，有可能是网络的原因，故要重复请求一下
var no_response_waitting_fail_time_max = crawl_para_json.no_response_waitting_fail_time_max;
// 搜索的关键字
var search_keyword = crawl_para_json.search_keyword;
// 正文抓取时对图片或txt的计数
var body_pic_or_txt_count = crawl_para_json.body_pic_or_txt_count;
// 任意给定的url抓取时的存放路径，在这里传的值已包含了文件父路径及文件名称，只需要在后边加后缀即可，而其后缀直接取值于前边对body定义的后缀取值，如txt、jpg等
var random_url_output_path_capture = crawl_para_json.random_url_output_path_capture;
var random_url_output_path_body = crawl_para_json.random_url_output_path_body;

// 图片页数记数
var count_render_pic = body_pic_or_txt_count;
// 抓取到的文本页数记数
var count_crawl_txt = body_pic_or_txt_count;
// 已经抓取过的页面记数，因为上边的图片和文本不一定要启用和记数，故在此独立记录已走过的实际页面
var count_crawl_page_number = 1;
// 标志该page中是否已注入过jquery.js文件了
var inject_jquery_flag = false;

// 对收到的response的计数
var receive_response_count_current = 0;
var receive_response_count_last = 0;
var receive_response_fail_count = 0;

// 超时设置
page.settings.resourceTimeout = 20000

// 周期检查是否请求过程中产生了死掉情况
function checkNoResponse() {
	if (receive_response_count_last == receive_response_count_current) {
		if (receive_response_fail_count < no_response_waitting_fail_time_max) {
			console.log('check fail response,will try again');
			// closePage();
			receive_response_fail_count++;
			openPage(root_url);
		} else {
			console.log('check response wait time arrive the max waitting time,phantom will exit!');
			phantom.exit();
		}
	}
	receive_response_count_last = receive_response_count_current;
}

// 启动周期检查有无回应
setInterval(checkNoResponse, no_response_waitting_time_max);

page.onAlert = function(msg) {
	console.log('ALERT: ' + msg);
};

page.onLoadFinished = function(status) {
	if (count_crawl_page_number > max_page_number) {
		console.log('the crawled page number is arrived to the max value,will exit phantomjs!');
		phantom.exit();
	}
	console.log('load finish--------');
	console.log('status---' + status);
	console.log('page.title---' + page.title);
	if (is_inject_jquery && !inject_jquery_flag) {
		if (inject_jquery_flag = page.injectJs(jquery_path)) {
			console.log('inject jquery sucessful!');
		} else {
			console.log('inject jquery fail!');
		}
	}
	console.log('page.url----' + page.url);

};

page.onUrlChanged = function(targetUrl) {

};

page.onResourceRequested = function(requestData, networkRequest) {
	 if(requestData.url.indexOf("getchartdata")>-1){
	 console.log("resource request header="+JSON.stringify(requestData.headers));
	 console.log("resource request cookie="+JSON.stringify(page.cookies));
	 }
//	 console.log("resource request url="+requestData.url);
};
page.onResourceTimeout = function(requestData) {
	
};
page.onResourceReceived = function(response) {
	
	receive_response_count_current++;
};

page.onResourceError = function(resourceError) {
	console.log('Unable to load resource (#' + resourceError.id + 'URL:'
			+ resourceError.url + ')');
	console.log('Error code: ' + resourceError.errorCode + '. Description: '
			+ resourceError.errorString);
};

function openPage(root_url) {
	page.open(root_url, function(status) {
		// 如果打开页面成功
		if (status === "success") {
			
				window.setTimeout(function() {
					if (is_capture_pic) {
						page.render(random_url_output_path_capture
								+ pic_file_suffix_name);
					}
					if (is_data_write_to_file) {
						fs.write(random_url_output_path_body
								+ data_file_suffix_name, page.content, 'w');
					}

					exit();
				}, 10000);
			
			console.log('page open is success');
		} else {
			console.log('page open is not success,phantomjs will exit!');
			exit();
		}
	});
}

function closePage() {
	page.close();
}

function exit() {
	phantom.exit();
}

openPage(root_url);