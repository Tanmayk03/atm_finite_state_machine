# ATM Simulator

This project is developed as part of the Automata Theory course, demonstrating the application of finite state machines in simulating the basic functionalities of an Automated Teller Machine (ATM). The simulator models the ATM workflow as a series of states and transitions, providing a practical example of automata concepts.

## Project Overview

The ATM Simulator allows users to interact with a virtual ATM, performing operations such as authentication, balance inquiry, deposits, withdrawals, and viewing transaction history. Each operation corresponds to a state in the automaton, and user actions trigger transitions between these states.

### States in the Simulator

- **Init State**: The starting point where the ATM awaits user input.
- **Authentication State**: User enters credentials to access their account.
- **Main Menu State**: User selects an operation (balance, deposit, withdraw, history).
- **Balance Inquiry State**: Displays the current account balance.
- **Deposit State**: Allows the user to add funds to their account.
- **Withdrawal State**: Enables the user to withdraw money, with checks for sufficient balance.
- **Transaction History State**: Shows a log of previous transactions.
- **Exit State**: Ends the session and logs out the user.

Transitions between these states are managed according to user input, reflecting the principles of automata theory.

## Features

- User authentication and session management
- Balance inquiry
- Deposit and withdrawal operations
- Transaction history tracking
- State-driven workflow based on automata concepts

## Getting Started

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/atm-simulator.git
    ```
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Run the simulator:**
    ```bash
    npm start
    ```

## Screenshot
<img width="1097" height="644" alt="image" src="https://github.com/user-attachments/assets/00f50c3e-85b6-49ca-8d78-751ab06be0e2" />
<img width="1032" height="559" alt="image" src="https://github.com/user-attachments/assets/49c4bec6-9810-4643-81f7-bc8012aad085" />


## Usage

After starting the simulator, follow the on-screen instructions to interact with the ATM. The application will guide you through each state, demonstrating how automata theory can be applied to real-world systems.

## Contributing

Contributions are welcome! If you have suggestions for new features, improvements, or bug fixes, please open an issue or submit a pull request. For major changes, please discuss them first via an issue to ensure alignment with the project's goals.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Developed for the Automata Theory course
- Inspired by real-world ATM workflows and finite state machine models

If you have any questions or feedback, feel free to reach out via the repository's issue tracker.
