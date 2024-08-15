# Uno Web App

Server-side rendering web app that allows users to play the real time multiplayer online game UNO.
With its user-friendly interface, the app enables users to create game session to play Uno with a number of players you define. Play UNO in multiple game sessions at the same time and send messages to your friends.

Some of the features UNO Web App offers are the following:
Authentication
- User shall be able to sign in/out
- User shall be able to sign up
Game management
- User shall be able to create a game session
- User shall be able to see the list of available game sessions
- User shall be able to join a game session
- User shall be able to play Uno within a game session
Chat management
- User shall be able to send messages in the chat within a specific game session
- User shall be able to send messages in the chat within the main lobby for everybody

## Branch Management

| Branch name | Description |
| ------------- | ------------- |
| `master` | Root branch. Production-ready branch. Only code that works and has no bugs will be here. |
| `development` | Child of `master`. Parent branch of features. Consolidate all features from child branches. |
| `authentication` | Child of `development` branch. Only authentication related features will be on this branch. |
| `game-mgmt` | Child of `development` branch. Only game management related features will be on this branch. |
| `chat-mgmt` | Child of `development` branch. Only chat management related features will be on this branch. |
| `front-wireframes` | Child of `development` branch. Only front-end adaptation to wireframes related changes will be on this branch. |

## The application was built using

| Category  | Name |
| ------------- | ------------- |
| Front-end  | HTML, CSS, Vanilla JavaScript  |
| Back-end  | JavaScript (NodeJS)  |
| Database  | PostgreSQL |
| Project Management | GitHub Projects |

## Main app dependencies used within the application

| Dependency  | Description |
| ------------- | ------------- |
| `bcrypt`  | NodeJS library used for password hashing |
| `Express` | NodeJS framework for building RESTful APIs |
| `EJS` | Template engine library for NodeJS that allows you to generate HTML markup with plain JavaScript |
| `Socket IO` | Event-driven library for real-time web apps. It enables real-time, bi-directional communication between web clients and servers. |
| `Postgres migrations (node-pg-migrate)` | PostgreSQL database migration management tool. Manage migrations with CLI support for up-down migrations, ensuring smooth database transitions. |

## Main developer dependencies used within the application

| Dependency  | Description |
| ------------- | ------------- |
| `Prettier` | Opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary. |
| `Tailwind CSS` | A utility-first CSS framework |
| `ESBuild` | Free and open-source module bundler and minifier for JavaScript and CSS |
| `Husky` | Ultra-fast modern native git hooks |

## Wireframes

- [Sign In](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/wireframes/1_Wireframe_SignIn.png)
- [Sign Up](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/wireframes/2_Wireframe_SignUp.png)
- [Lobby Screen](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/wireframes/3_Wireframe_LobbyScreen.png)
- [Game Session](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/wireframes/4_Wireframe_GameSession_p1.png)
- [Game Session Uno](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/wireframes/5_Wireframe_GameSession_p2.png)

## Getting started

### Prerequisites

- Have npm package installed
```
npm install npm@latest -g
```
- Install PostgreSQL 
- Create an empty DB with default settings in the PostgreSQL Server (e.g. mydb)

### Installation

1. Clone the repository
```
git clone https://github.com/LMAR5/csc867-uno-game-webapp.git
```
2. Go into the new directory
```
cd csc867-uno-game-webapp
```
3. Create a .env file with the following values:
```
NODE_ENV=development
PORT=3000
SESSION_SECRET=<your_own_secret_key>
DATABASE_URL=postgresql://[user]:[password]@localhost:5432/<your db name>
```
4. Install NPM packages
```
npm i
```
5. Run the migrations files to create DB schema
```
npm run db:migrate
```
6. Run the app
```
npm run start:dev
```
7. Go to your browser and access localhost:3000

## App Screenshots

### Landing page

![Landing](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/Landing.jpg)

### Sign-up
User needs to create an account providing its firstname, lastname, email, and password
Stored passwords are encrypted using bcrypt, a cryptographic hashing function.

![SignUp](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/SignUp.jpg)

### Sign-in
User access the app by providing its email and password.

![SignIn](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/SignIn.jpg)

If provided credentials doesn't exist, app displays error message.

![SignIn](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/SignInError.jpg)

### Main Lobby
Lobby where users will see all available game sessions they can join and current session they are part of.

![MainLobby](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/MainLobby.jpg)
![MainLobbyCurrent](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/MainLobbyCurr.jpg)

### Create a game session
To create a game session the user must provide a name and the number of players for the game.

![CreateGame](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/CreateGame.jpg)

### Game room
If number of players is not completed yet, user will see a UNO card facing down waiting for other players.

![NumPlayersNotComplete](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/PlayersNotComplete.jpg)

If number of players is completed, the app assigns 7 UNO cards to each player randomly.

![NumPlayersComplete](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/PlayersComplete.jpg)

The app validates each play against UNO rules (same color/number/symbol, special cards, etc) and displays error messages for invalid plays or when it's not the user's turn

![ValidationMessage](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/ValidationMessage.jpg)
![NotUserTurn](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/NotUserTurn.jpg)

### Winner page
If a user wins a game session (has 0 cards on hand) the app redirects all players to the game end page, displaying the winner of the game

![WinnerPage](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/WinnerPage.jpg)

### Chat
Send messages to everybody in the lobby and in specific game rooms

![LobbyChat](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/LobbyChat.jpg)
![GameSessionChat](https://github.com/LMAR5/csc867-uno-game-webapp/blob/master/screenshots/GameSessionChat.jpg)
