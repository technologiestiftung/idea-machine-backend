import fs from "node:fs";
import { execSync } from "child_process";
import { htmlFilePath, pdfFilePath } from "./constants.js";

export async function createPostcard(idea, imgURL) {
	console.log(idea);
	createPostcardHtml(idea, imgURL);
	createPostcardPdf();
}

function createPostcardHtml(idea, imgURL) {
	const html = `<!DOCTYPE html>
	<html lang="de">
		<head>
			<link rel="stylesheet" href="./postcard.css">
			<link href="./font/jersey20.woff2" rel="stylesheet">
			<title>Postcard</title>
		</head>
		<body>
			<div class="frontside">
				<img src="${imgURL}" alt="Illustration"/>
			</div>
			<div class="backside">
				<div class="message">
					<div class="text">
						<div class="title-behind">Grüße aus der Zukunft!</div>
						<div class="title">Grüße aus der Zukunft!</div>
						<div class="idea">${idea.idea}</div>
					</div>
					<div class="dices">
						<div class="dice1"><img src="./img/cube.svg" /> Wer? ${idea.focusGroup}</div>
						<div class="dice2"><img src="./img/cube.svg" /> Was? ${idea.topic}</div>
						<div class="dice3"><img src="./img/cube.svg" /> Wo? ${idea.medium}</div>
					</div>
				</div>
				<div class="sender">
					<div class="header">
						<div class="credits">
							Sommerkonferenz 
							<br/>
							27 Juni 2024
						</div>
						<div class="stamp">
							<img src="img/citylab-logo_white.png" alt="Stamp" width="90%">
						</div>
					</div>
					<div class="address">
						<div class="line">
							<p>Platz der Luftbrücke 4</p>
						</div>
						<div class="line">
							<p>12101 Berlin</p>
						</div>
						<div class="line">
							<p>info@citylab-berlin.org</p>
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
	`;

	try {
		fs.writeFileSync(htmlFilePath, html);
	} catch (error) {
		console.error(error);
	}
}

function createPostcardPdf() {
	try {
		execSync(
			`${process.env.CHROMIUM_EXECUTABLE_PATH} --headless --print-to-pdf=${pdfFilePath} ${htmlFilePath}`,
		);

		// execSync(
		// 	`chromium-browser --headless --print-to-pdf=${pdfFilePath} ${htmlFilePath}`,
		// );
	} catch (error) {
		console.error(error);
	}
}
