// pages/api/fetchMarkdown.js

import fs from "fs"
import path from "path"
import { remark } from "remark"
import html from "remark-html"

export default async (req, res) => {
	try {
		const markdownDirPath = path.join(
			process.cwd(),
			`writing\\${req.body.folder}`
		)
		const markdownFiles = fs.readdirSync(markdownDirPath)

		const markdownFileData = await Promise.all(
			markdownFiles.map(async (fileName) => {
				const markdownFilePath = path.join(
					markdownDirPath,
					fileName
				)
				const markdownContent = fs.readFileSync(
					markdownFilePath,
					"utf-8"
				)
				const image = markdownContent.split("---")[0]
				const htmlContent = await remark()
					.use(html)
					.process(markdownContent.split("---")[1])
				return {
					ffileName: fileName,
					image: image,
					html: htmlContent.toString(),
				}
			})
		)

		res.status(200).json(markdownFileData)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
