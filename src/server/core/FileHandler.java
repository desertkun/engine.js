package core;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class FileHandler implements HttpHandler {

	@Override
	public void handle(HttpExchange h) throws IOException {
		System.out.println(h.getRequestMethod() + " " + h.getRequestURI());		
		OutputStream os = h.getResponseBody();
		String filePath = h.getRequestURI().toString();

		if (filePath.equals("/"))
			filePath = "/index.html";

		filePath = Main.documentRoot + filePath;

		File f = new File(filePath);

		if (f.isFile()) {			
			Headers hdr = h.getResponseHeaders();
			hdr.add("Content-Type", Files.probeContentType(f.toPath()));			
			FileInputStream fs = new FileInputStream(f);
			hdr.add("Content-Length", String.valueOf(fs.available()));
			h.sendResponseHeaders(200, 0);
			
			final byte[] buffer = new byte[0x10000];
			int count = 0;
			while ((count = fs.read(buffer)) >= 0) {
				os.write(buffer, 0, count);
			}
			fs.close();
			os.close();
		} else {
			System.out.printf("File %s/%s not found!\n",
					System.getProperty("user.dir"), filePath);
			String error404 = "<h1>404 File not found</h1>";
			
			h.sendResponseHeaders(404, 0);
			h.getResponseBody().write(error404.getBytes());
			h.getResponseBody().close();
		}

		os.close();
	}
}
