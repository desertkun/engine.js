package core;

import java.awt.Desktop;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import com.sun.net.httpserver.HttpServer;

public class Main {

	private static InetSocketAddress addr;
	private static HttpServer srv;

	public static String documentRoot = "data";

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		addr = new InetSocketAddress("127.0.0.1", 8888);

		try {
			srv = HttpServer.create(addr, 10);
			srv.createContext("/", new FileHandler());
			System.out.println("Server started");
			openWebpage(new URL("http://127.0.0.1:8888"));
			srv.start();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static void openWebpage(URI uri) {
		Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop()
				: null;
		if (desktop != null && desktop.isSupported(Desktop.Action.BROWSE)) {
			try {
				desktop.browse(uri);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	public static void openWebpage(URL url) {
		try {
			openWebpage(url.toURI());
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

}
