import { App, us_listen_socket_close, us_socket_local_port } from "uWebSockets.js";
import { promises as fs } from "node:fs";
import { error, info } from "node:console";
import process, { exit, env } from "node:process";
import { tmpdir } from "node:os";
import { extendApp } from "@ublitzjs/core";
import { dynamicServe, analyzeFolder } from "@ublitzjs/static/serving";
import { urlStartsWith, basicSendFile } from "@ublitzjs/static";
import { serverExtension as sitemapExtension } from "@ublitzjs/sitemap";
info("in env you can pass something like this: \n PORT=8080 MAP=/here serve.sh \nBy default no sitemap is generated")

var PORT = Number(env.PORT);
var listenSocket;
if(PORT < 0 || PORT > 64*1024){
  error("run this script with PORT: \n PORT=8080 serve.sh");
  exit(1);
}



var server = extendApp(
  App(),
  sitemapExtension("http://localhost:"+PORT+"/")
);

if(env.MAP){
  var sitemapPath = tmpdir() + '/' + Date.now() + "_sitemap.xml";
  var folderStructure = await analyzeFolder(".", {
    avoid: /node_modules|\.git/
  })

  for (const path in folderStructure)
    server.sitemap.add({
      loc: path
    })
  await server.sitemap.build(sitemapPath, false);
  var fileSize = await fs.stat(sitemapPath).then(s => s.size);
  server.get(env.MAP || "/sitemap.xml", basicSendFile({
    maxSize: fileSize,
    path: sitemapPath,
    contentType: "text/xml"
  }));
  
}

var methods = dynamicServe(urlStartsWith("/"), ".", {
  avoid: /node_modules|\.git/
});

server.get("/*", methods.get).head("/*",  methods.head);



server.listen(PORT, (socket)=>{
  console.log("LISTENING?",!!socket, "PORT:", us_socket_local_port(socket));
  listenSocket = socket;
})
process.once("SIGINT", async ()=>{
  us_listen_socket_close(listenSocket);
  if(env.MAP) await fs.rm(sitemapPath);
  console.log("\nClosing\n");
})
