package com.cqupt.common.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.log4j.Logger;

import com.cqupt.common.statics.StaticValueOfRule;
import com.cqupt.common.statics.SystemParasSpider;

/**
 * phantomjs操作相关类
 * 
 * @author zel
 * 
 */
public class PhantomJsOperatorUtil {
	// 加入日志log4j
	public static Logger logger = Logger.getLogger(PhantomJsOperatorUtil.class);

	public static boolean crawl(String configFilePath, String crawlJsPath,
			String crawlParaFilePath) {
		BufferedReader br = null;
		try {
			Runtime runtime = Runtime.getRuntime();
			String command_line = SystemParasSpider.phantomjs_path
					+ SystemParasSpider.phantomjs_exe_name
					+ StaticValueOfRule.separator_space + "--config "
					+ configFilePath + StaticValueOfRule.separator_space
					+ crawlJsPath + StaticValueOfRule.separator_space
					+ crawlParaFilePath;
			logger.info("command_line---" + command_line);
			Process process = runtime.exec(command_line);
			InputStream is = process.getInputStream();
			process.getErrorStream().close();
			process.getOutputStream().close();
			br = new BufferedReader(new InputStreamReader(is));
			String temp = null;
			while ((temp = br.readLine()) != null) {
				System.out.println(temp);
			}
			return true;
		} catch (IOException e) {
			logger.info("phantomjs 在爬取网页信息时出现异常，请检查!");
			logger.info(e.getLocalizedMessage());
			return false;
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}

	public static void main(String[] args) {
		String configFilePath = SystemParasSpider.phantomjs_crawl_config_json_root_path
				+ "config_phantomjs.json";
		String crawlJsPath = SystemParasSpider.phantomjs_crawl_config_js_root_path
				+ "baidu_crawl.js";
		String crawlParaFilePath = SystemParasSpider.phantomjs_crawl_config_js_para_root_path
				+ "config_crawl_para.json";

		crawl(configFilePath, crawlJsPath, crawlParaFilePath);
	}
}
