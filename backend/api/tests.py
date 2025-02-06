from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


# Create chat model
chat = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY)

# Initialize conversation memory
memory = ConversationBufferMemory(return_messages=True)

# Create conversation chain
conversation = ConversationChain(llm=chat, memory=memory, verbose=False)


def save_conversation_history(filename=None):
    """Save the conversation history to a file"""
    if filename is None:
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"chat_history_{timestamp}.txt"

    messages = memory.chat_memory.messages

    with open(filename, "w", encoding="utf-8") as f:
        f.write("=== Conversation History ===\n\n")
        for message in messages:
            if isinstance(message, HumanMessage):
                f.write(f"You: {message.content}\n")
            else:
                f.write(f"AI: {message.content}\n")
            f.write("\n")  # Add blank line between messages
        f.write("==========================")

    return filename


def display_conversation_history():
    """Display the entire conversation history"""
    clear_screen()
    print("\n=== Conversation History ===\n")

    messages = memory.chat_memory.messages

    for message in messages:
        if isinstance(message, HumanMessage):
            print(f"\033[94m👤 You: {message.content}\033[0m")
        else:
            print(f"\033[92m🤖 AI: {message.content}\033[0m")

    print("\n==========================\n")


def chat_with_memory(user_input):
    """Process user input and get AI response"""
    response = conversation.predict(input=user_input)
    return response


def main():
    clear_screen()
    print("\n=== Welcome to Gemini Chat ===")
    print("Commands:")
    print("- 'exit': End chat, save history, and exit")
    print("- 'save': Save current history to file")
    print("- 'clear': Clear the screen")
    print("- 'history': View conversation history")
    print("================================\n")

    while True:
        try:
            user_input = input("\033[94m👤 You: \033[0m").strip()

            if user_input.lower() == "exit":
                display_conversation_history()
                filename = save_conversation_history()
                print(f"\nChat history saved to: {filename}")
                break
            elif user_input.lower() == "save":
                filename = save_conversation_history()
                print(f"\nChat history saved to: {filename}")
                continue
            elif user_input.lower() == "clear":
                clear_screen()
                continue
            elif user_input.lower() == "history":
                display_conversation_history()
                continue
            elif not user_input:
                continue

            response = chat_with_memory(user_input)
            print(f"\033[92m🤖 AI: {response}\033[0m")

        except KeyboardInterrupt:
            print("\n\nExiting gracefully...")
            filename = save_conversation_history()
            print(f"\nChat history saved to: {filename}")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
