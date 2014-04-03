package core;

import java.awt.Desktop;
import java.awt.Image;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;

import com.sun.net.httpserver.HttpServer;

public class Main {

	private static InetSocketAddress addr;
	private static HttpServer srv;

	public static String appName = "Minimal HTTP Server";
	public static String documentRoot = "data";
	public static String bindHost = "127.0.0.1";
	public static int port = 8888;

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		addr = new InetSocketAddress(bindHost, port);

		try {
			JFrame frame = new JFrame(appName);
			frame.setSize(200, 100);

			String serverUrl = "http://" + bindHost + ":"
					+ String.valueOf(port);

			JLabel label = new JLabel("<html><p>Running " + appName
					+ " at <a href=\"" + serverUrl + "\">" + serverUrl
					+ "</a></p>" + "<p>Document root is <b>"
					+ System.getProperty("user.dir") + "/" + documentRoot
					+ "</b></p>"
					+ "<p>Just close this window to stop the server</p></html>");

			frame.add(label);
			frame.pack();
			frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
			frame.setVisible(true);

			srv = HttpServer.create(addr, 10);
			srv.createContext("/", new FileHandler());
			System.out.println("Server started");
			openWebpage(new URL("http://127.0.0.1:8888"));
			srv.start();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	protected static Image createImage(String path, String description) {
		URL imageURL = Main.class.getResource(path);

		if (imageURL == null) {
			System.err.println("Resource not found: " + path);
			return null;
		} else {
			return (new ImageIcon(imageURL, description)).getImage();
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
