
# Genzconnect: Enhancing Remote Classrooms

Genzconnect is an integrated platform designed to streamline and enhance the remote classroom process. Tailored for recruiters and interviewees alike, Genzconnect provides an intuitive interface where candidates can effectively showcase their skills, and recruiters can conduct seamless interviews.

**Live Website:** [Genzconnect Live Website](https://genzconnect-f5082.web.app)

## Features

### 1. Audio-Video Interface

- **Technology:** Implemented using WebRTC
- **Connection Type:** Peer-to-peer for low-latency and high-quality video calls
- **Hosting:** Supports direct peer-to-peer connections

### 2. Real-Time Whiteboard

- **Technology:** Implemented using Socket.IO
- **Features:**
  - Collaborative whiteboard for visual explanations and problem-solving
  - Real-time updates for effective communication
- **Hosting:** Hosted on Vercel
- **Access:** [Virtual Whiteboard](https://genz-whiteboard.vercel.app/)

### 3. GitHub Profile Integration

- **Technology:** Implemented using GitHub v3 API
- **Features:**
  - Overview of repositories showcasing the candidate's coding skills
  - Activity feed to understand the candidate's recent contributions and interests

### 4. Chat Interface

- **Technology:** Implemented using Socket.IO
- **Features:**
  - Real-time chat for quick communication during interviews
  - Supports both text and multimedia messages
- **Hosting:** Hosted on Vercel
- **Access:** [Chat Interface](https://genz-chat-six.vercel.app/)

### 5. Virtual Environment

- **Technology:** Implemented using Nuvepro CloudLab API
- **Features:**
  - Virtual classrooms for a structured interview experience
  - Customizable environments to simulate real-world scenarios
- **Hosting:** Hosted on Google Cloud Platform

## Contributors

- **Karan Dixit:** Lead Developer &  Backend Developer
- **Kushal Sharma:**Frontend Developer & UI/UX Designer
- **Sanskriti Gupta:** Support 
- **Rashi Garg:** Documentation

## License

This project is licensed under the [MIT License](LICENSE).

## Structure

```
Genzconnect
├── driver
│   ├── pre_class              # Main folder for pre-class functionalities
│   │   ├── index.html         # HTML file for pre-class interface
│   │   └── main.js            # JavaScript file for pre-class functionalities
│   ├── room                  # Main folder for virtual room functionalities
│   │   ├── virtual_room       # Main folder for virtual room functionalities
│   │   │   ├── whiteboard     # Contains files related to the virtual whiteboard
│   │   │   │   ├── whiteboard.html    # HTML file for whiteboard interface
│   │   │   │   └── whiteboard.js      # JavaScript file for whiteboard functionalities
│   │   │   └── chatbot        # Contains files related to the chatbot
│   │   │       ├── chatbot.html       # HTML file for chatbot interface
│   │   │       └── chatbot.js         # JavaScript file for chatbot functionalities
│   │   ├── gui.ui             # GUI file (in .ui format) for room
│   │   └── main.js            # Main driver program for room
│   │   └── requirements.txt   # All dependencies of the room functionalities
│   ├── config                 # Contains all secret API Keys and configurations
│   ├── features               # All functionalities of Genzconnect
│   └── utils                  # GUI images and utility files
├── gui.ui                     # GUI file (in .ui format)
└── main.js                    # Main driver program of Genzconnect
```
