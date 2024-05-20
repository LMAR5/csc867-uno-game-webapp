# Term Project

- Team: I
- Game: Uno

## Team organization

| Feature area | Team member |
| ------------- | ------------- |
| Authentication | Kemi Adebisi |
| Chat Management | Yuquan Xu |
| Game Management | Luis Aguilar and William Austin Ocampo |
| Adapt UI to wireframes | Sungmu Cho |

## Branch Management

| Branch name | Description |
| ------------- | ------------- |
| `master` | Root branch. Production-ready branch. Only code that works and has no bugs will be here. |
| `development` | Child of `master`. Parent branch of features. Consolidate all features from child branches. |
| `authentication` | Child of `development` branch. Only authentication related features will be on this branch. |
| `game-mgmt` | Child of `development` branch. Only game management related features will be on this branch. |
| `chat-mgmt` | Child of `development` branch. Only chat management related features will be on this branch. |
| `front-wireframes` | Child of `development` branch. Only front-end adaptation to wireframes related changes will be on this branch. |

## Tech stack used to build the app

| Category  | Name |
| ------------- | ------------- |
| Front-end  | HTML, CSS, Vanilla JavaScript  |
| Back-end  | JavaScript (NodeJS)  |
| Database  | PostgreSQL |
| Project Management  | [GitHub Projects](https://github.com/orgs/sfsu-csc-667-spring-2024-roberts/projects/8)  |
| Knowledge Database | [GitHub Wiki](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno/wiki) |
| Documents Storage | OneDrive |

## Wireframes

- [Sign In](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno/blob/master/wireframes/1_Wireframe_SignIn.png)
- [Sign Up](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno/blob/master/wireframes/2_Wireframe_SignUp.png)
- [Lobby Screen](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno/blob/master/wireframes/3_Wireframe_LobbyScreen.png)
- [Game Session](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno/blob/master/wireframes/4_Wireframe_GameSession_p1.png)
- [Game Session Uno](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno/blob/master/wireframes/5_Wireframe_GameSession_p2.png)

## Getting started

### Prerequisites

- Have npm package installed
```
npm install npm@latest -g
```
- Have postgres DB server installed
- Have an empty DB created in the PosgreSQL server (e.g. mydb)

### Installation

1. Clone the repository
```
git clone https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-i-uno.git
```
2. Go into the new directory
```
cd term-project-team-i-uno
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
