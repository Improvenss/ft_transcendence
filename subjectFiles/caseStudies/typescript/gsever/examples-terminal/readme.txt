		TERMINAL 

LINK: https://www.npmjs.com/package/ts-node-dev
You must be install packages first!

// Manually compile and run;
	$> npm install --global ts-node

// Auto compile and run;
	$> npm install ts-node-dev --save-dev

This package must be installed;
	../node_modules/.bin/

------------------------------------------

Manually compile and run:

	$> ts-node ts-node-example.ts

If you want to see auto compile and run:

	$> ../node_modules/.bin/ts-node-dev --respawn ts-node-example.ts

You must run this command.
This command when you save .ts and did any changes,
 it's automatically compiling and running your main.ts file.

------------------------------------------

If you want to run 'npm start' command:

You must be add this code inside package.json file.

"scripts": {
	"start": "ts-node-dev --respawn ./examples-terminal/ts-node-example.ts"
}

------------------------------------------

If you want to run with your gived file with run 'npm start my_file.ts':

You must be add this code inside package.json file.

"scripts": {
	"start": "ts-node-dev --respawn"
}

NOTE: If you add '--quiet' flag, no print this:
"[INFO] 18:21:48 Restarting: /Users/yuandre/Desktop/main42gsever/projes/main/16ft_transcendence/subjectFiles/caseStudies/typescript/gsever/examples-terminal/ts-node-example2.ts has been modified"
