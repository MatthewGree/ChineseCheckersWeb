import java.io.IOException;
import java.io.PrintStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Scanner;

/**
 * Test
 */
public class Test {
    public static void main(String[] args) {
        try {
            ServerSocket socket = new ServerSocket(5888);
            Socket client = socket.accept();
	    System.out.println("Client acquired");
            Scanner scanner = new Scanner(client.getInputStream());
            PrintStream printer = new PrintStream(client.getOutputStream());
	    Boolean isKeepGoing = true;
	    while (isKeepGoing) {
	    System.out.println("Waiting for response");
	    String response = scanner.nextLine();
	    System.out.println("response gotten");
	    System.out.println(response);
            printer.println("Hello client\nHi client");
	    }
            socket.close();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
	}
    }
}
