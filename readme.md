# Live-server script (using uBlitz.js)
## Get started
Clone this repo and link serve.sh to you "bin" folder somewhere (like /usr/bin)
Then "cd" in some directory and run "serve.sh". 
Now you have your folder served on some random port (is given in the output).
## Config
Eveything uses environment variables.
> PORT=8080 MAP=/current\_sitemap.xml serve.sh
here you give specific port AND tell script to read working directory and serve its sitemap on /current\_sitemap.xml
