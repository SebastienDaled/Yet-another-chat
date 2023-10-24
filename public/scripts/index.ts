// Import the functions you need from the SDKs you need
import { 
    initializeApp, 
} from "firebase/app";

import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
    setPersistence,
    browserSessionPersistence,
    GithubAuthProvider,
    GoogleAuthProvider,
    updateProfile
} from "firebase/auth";

import {
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  onSnapshot, 
  query,
  orderBy,
  limit,
  arrayUnion
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiQmGRHtC_nOhBdNUB4dRyUgIIDKP9CBc",
  authDomain: "yet-another-chat-170c4.firebaseapp.com",
  projectId: "yet-another-chat-170c4",
  storageBucket: "yet-another-chat-170c4.appspot.com",
  messagingSenderId: "173635889833",
  appId: "1:173635889833:web:5cb9ba6abbf3a6a819d7b8"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore();

const collectionRef = collection(db, 'Chats');
const q = query(collectionRef, orderBy("lastMessageDate", "desc"));

// get account providers
const provider = new GoogleAuthProvider();

// init authentication
const auth : any = getAuth();

let user : any;


const signUpForm : any = document.querySelector(".signup");
const lognInForm : any = document.querySelector(".login");
const logOutButton : any = document.querySelector(".logoutbtn");

const googleBtn : any = document.querySelectorAll(".google");
const githubBtn : any = document.querySelectorAll(".github");

signUpForm.addEventListener('submit', (e: { preventDefault: () => void; }) => {
  e.preventDefault();

  const email = signUpForm.email.value;
  const password = signUpForm.password.value;
  const username = signUpForm.username.value;

  createUserWithEmailAndPassword(auth, email, password)
  .then(cred => {
    // console.log('user created:' + cred.user);

    updateProfile(auth.currentUser, {
      displayName: username
    }).then(() => {
      // Profile updated!
      // ...
    }).catch((error) => {
      // An error occurred
      // ...
    });

    signUpForm.reset();
    
    LoggedIn();
  }).catch(err => {
    // console.log(err.message);
  })
}) 

lognInForm.addEventListener('submit', (e: { preventDefault: () => void; }) => {
  e.preventDefault();

  const email = lognInForm.email.value;
  const password = lognInForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
  .then(cred => {
    
    console.log('user logged in:' + cred.user);
    lognInForm.reset();
    LoggedIn();
  }).catch(err => {
    // console.log(err.message);
  })
})

googleBtn.forEach((google: { addEventListener: (arg0: string, arg1: () => void) => void; }) => {
  google.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential : any = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
            LoggedIn();
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });    
})
});

githubBtn.forEach((git: { addEventListener: (arg0: string, arg1: () => void) => void; }) => {
  git.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential : any = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
  
        // The signed-in user info.
        const user = result.user;
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GithubAuthProvider.credentialFromError(error);
        // ...
      });
  })
});

const goToSignUpBtn : HTMLElement | any = document.getElementById("signupBtn");
const goToLoginBtn : HTMLElement | any = document.getElementById("loginBtn");
const quitBtn : HTMLElement | any = document.querySelectorAll(".quit");

const chatSection : HTMLElement | any = document.getElementById("chats");
const chatsDiv : HTMLElement | any = document.getElementById("chatsBalk");
const searchInput : HTMLElement | any = document.getElementById("search");
const chatroomSection : HTMLElement | any = document.getElementById("chat");

const addChatBtn : any = document.getElementById("addChat");
const addChatFrom : any = document.getElementById("addChats");
const addChatContainer : any = document.getElementById("addChatsContainer");

let chatBtn : HTMLElement | any;

const chatNameH3 : HTMLElement | any = document.getElementById("chatname");
const sendBtn : HTMLElement | any = document.getElementById("sendBtn");
const messageInput : HTMLElement | any = document.getElementById("inputMessage")


goToSignUpBtn.addEventListener("click", () => {
  changeRegestration()
});
goToLoginBtn.addEventListener("click", () => {
  changeRegestration()
});
const changeRegestration = () => {
  if (signUpForm.classList.contains("hide")) {
    signUpForm.classList.remove("hide");
    lognInForm.classList.add("hide");
  } else if (!signUpForm.classList.contains("hide")) {
    signUpForm.classList.add("hide");
    lognInForm.classList.remove("hide");
  }
}



const LoggedIn = () => {
    if (!signUpForm.classList.contains("hide")) {
        signUpForm.classList.add("hide");
        chatSection.classList.remove("hide");
    }
    if (!lognInForm.classList.contains("hide")) {
        lognInForm.classList.add("hide");
        chatSection.classList.remove("hide");
    }
    user = auth.currentUser;
    // console.log(user);
    
    // console.log("je bent ingelogd");
    showChats();
}

const showChats = () => {
  
  onSnapshot(q, (snapshot) => {
    
    let chats : any[] = [];
    chatsDiv.innerHTML = "";

    snapshot.docs.forEach(doc => {
      // console.log(doc.data().chatName);
      console.log(doc);
      
      // console.log(doc.data().leftusers);
      const left = doc.data().leftusers;
      if (left.length === 0) {
        chats.push({ ...doc.data(), name: doc.id })
      } else {
        let leftids: any[] = [];
        left.forEach((el: any) => {
          leftids.push(el.id)
        }); 

        if (!leftids.includes(user.uid)) {
          chats.push({ ...doc.data(), name: doc.id })
        }
      }
       
      
    })
    // console.log(chats);
  
    chats.forEach(chat => {
      createChatsHome(chatsDiv, chat);
    })

    getchatbtns()
  })
  
}

const createChatsHome = (div : any, object: {  chatName : string, name : string, berichten: any;}) => {
  // console.log(object.berichten);
  const containerDiv : HTMLElement | null = document.createElement("div");
  containerDiv.setAttribute("class", "chat")
  const newdiv : HTMLElement | null = document.createElement("div");
  newdiv.setAttribute("id", object.name);
  const newTitle : HTMLElement | null = document.createElement("h3");
  newTitle.innerText = object.chatName;
  newdiv.appendChild(newTitle);
  const newtext : HTMLElement | null = document.createElement("p");
  newtext.innerText = object.berichten.length === 0 ? "er is nog geen bericht" : object.berichten[object.berichten.length - 1].userName + ": " + object.berichten[object.berichten.length - 1].inhoud;
  
  newdiv.appendChild(newtext);
  containerDiv.appendChild(newdiv);

  div.appendChild(containerDiv);
}


searchInput.addEventListener("input", (event : any) => {
  const term = event.target.value.toLowerCase();
  console.log(term);
  
  onSnapshot(collectionRef, (snapshot) => {
    const chatsDiv : HTMLElement | any = document.getElementById("chatsBalk");
    chatsDiv.innerHTML = "";
    let chats : any[] = [];

    snapshot.docs.forEach(doc => {
      console.log(doc);
      
      if (doc.data().chatName.toLowerCase().includes(term)) {
        // chats.push({ ...doc.data(), name: doc.id })
        const left = doc.data().leftusers;
      if (left.length === 0) {
        chats.push({ ...doc.data(), name: doc.id })
      } else {
        let leftids: any[] = [];
        left.forEach((el: any) => {
          leftids.push(el.id)
        }); 

        if (!leftids.includes(user.uid)) {
          chats.push({ ...doc.data(), name: doc.id })
        }
      }
      }
    })
  
    chats.forEach(chat => {
      createChatsHome(chatsDiv, chat);
    })
    getchatbtns()
  })
})

addChatBtn.addEventListener("click", () => {
  // maak de add chat form zichtbaar
  addChatContainer.classList.remove("hide");
})

addChatFrom.addEventListener("submit", async (e: { preventDefault: () => void; }) => {
  e.preventDefault();

  const todayDate = new Date();
  const date = todayDate.getFullYear()+'-'+(todayDate.getMonth() + 1)+'-'+todayDate.getDate()+ " " + (todayDate.getHours()<10?'0':'') + todayDate.getHours() + ":" + (todayDate.getMinutes()<10?'0':'') + todayDate.getMinutes() + ":" + (todayDate.getSeconds()<10?'0':'') + todayDate.getSeconds();
  // console.log(date);
  
  await setDoc(doc(db, "Chats", makeRandomId(20)), {
    chatName: addChatFrom.naam.value,
    createdDate: date,
    berichten: [],
    lastMessageDate: date,
    leftusers: []
  })
  addChatFrom.reset();
  addChatContainer.classList.add("hide");
})

const getchatbtns = () => {
    chatBtn = document.querySelectorAll('.chat');
    // console.log("created")
    // console.log(chatBtn);
    chatBtn.forEach((btn: {
      firstChild: any;
      id: any; addEventListener: (arg0: string, arg1: () => void) => void; 
}) => {
      // console.log(btn);
      
      const chatId = btn.firstChild.id;
      // console.log(btn.firstChild.id);
      
      btn.addEventListener("click", () => {
        goToChat(chatId);
      })
    });
}

const goToChat = (id : any) => {

    // console.log(id);
  
    onSnapshot(q, (snapshot) => {
      let chats : any;

      snapshot.docs.forEach(doc => {
        // console.log(doc.data());
        
        if (doc.id === id) {
          chats = ({ ...doc.data(), name: doc.id })
        }
      })
      // console.log(chats);
  
      createChatroom(chats);
  })
}
// goToChat();
const createChatroom = (object : {chatName : string, berichten : string, name : string}) => {
  // console.log(object.berichten);
  chatroomSection.classList.remove("hide");
  chatSection.classList.add("hide");
  messageInput.name = object.name;
  chatNameH3.innerText = object.chatName;

  
  onSnapshot(collectionRef, (snapshot) => {
    let messages : any;

    snapshot.docs.forEach(doc => {
      if (doc.id === object.name) {
        messages = ({ ...doc.data(), name: doc.id }) 
      } 
    })
    
    const berichtenArr : string[] = messages.berichten;
    // console.log(berichtenArr);
    showMessages(berichtenArr)
  })
}
const showMessages = (berichten : any) => {
  // console.log(berichten);
  // controleer userid met ingelogde userid
  // toon het bericht
  // toon de naam / email
  // toon tijd van bericht
  const allmessages : HTMLElement | any = document.getElementById("messages");
  
  allmessages.innerHTML = "";
  berichten.forEach((bericht: {
    userName: string;
    inhoud: string; userID: any; 
}) => {
    // console.log(bericht.userID);
    // console.log(user.uid);
    const container = document.createElement("div");
    container.classList.add("containerMess");
    const message = document.createElement("div");
    message.classList.add("message");
    const name = document.createElement("h6");
    name.innerText = bericht.userName;
    const text = document.createElement("p");
    text.innerText = bericht.inhoud;

    container.appendChild(name);
    container.appendChild(message);
    message.appendChild(text)
    if (user.uid === bericht.userID) {
      // console.log("mijn bericht");
      container.classList.add("message-own")
    } else if (user.uid != bericht.userID) {
      // console.log("niet mijn bericht");
      container.classList.add("message-other");
    }
    allmessages.appendChild(container);
  });
}
const makeMessage =  async () => {
  const message = messageInput.value;
  const chatID = messageInput.name;

  // console.log(chatID);
  // console.log(message);
  const todayDate = new Date();
  const dateHM = todayDate.getHours() + ":" + (todayDate.getMinutes()<10?'0':'') + todayDate.getMinutes();
  const dateAll = todayDate.getFullYear()+'-'+(todayDate.getMonth() + 1)+'-'+todayDate.getDate()+ " " + (todayDate.getHours()<10?'0':'') + todayDate.getHours() + ":" + (todayDate.getMinutes()<10?'0':'') + todayDate.getMinutes() + ":" + (todayDate.getSeconds()<10?'0':'') + todayDate.getSeconds();
  
  await updateDoc(doc(db, "Chats", chatID), {
    berichten: arrayUnion({
      inhoud: message,
      userID: user.uid,
      madeDate: dateHM,
      userName: user.displayName
    }),
    lastMessageDate: dateAll
  });
}

sendBtn.addEventListener("click", () => {
  makeMessage()
  messageInput.value = "";
})
const makeRandomId = (length : number) => {
    let result : string = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    // console.log(result);
    
    return result;
}

const quit = () => {
  if (!chatroomSection.classList.contains("hide")) {
    chatroomSection.classList.add("hide");
    chatSection.classList.remove("hide");
  }
  if (!addChatContainer.classList.contains("hide")) {
    addChatContainer.classList.add("hide");
  }
}

quitBtn.forEach((btn: { addEventListener: (arg0: string, arg1: () => void) => void; }) => {
  btn.addEventListener("click", () => {
    quit();
  })
});

const searchBarBtn : HTMLElement | any = document.getElementById("searchBtn");
const searchBar : HTMLElement | any = document.getElementById("searchbar");
const menu : HTMLElement | any = document.getElementById("menu");

const showSearchBar = () => {
  if (searchBar.classList.contains("hide")) {
    searchBar.classList.remove("hide");
    chatsDiv.style.marginTop = "8rem";
  } else {
    searchBar.classList.add("hide");
    chatsDiv.style.marginTop = "4rem";
  }
}

searchBarBtn.addEventListener('click', () => {
  showSearchBar();
})



const optionBtn : HTMLElement | any = document.getElementById("options");
const logoutBtn : HTMLElement | any = document.getElementById("logout");

const showLogoutbtn = () => {
  if (logoutBtn.classList.contains("hide")) {
    logoutBtn.classList.remove("hide");
  } else {
    logoutBtn.classList.add("hide");
  }
}
optionBtn.addEventListener("click", () => {
  if (!chatSection.classList.contains("hide")) {
    showLogoutbtn();
  }
  if (!chatroomSection.classList.contains("hide")) {
    showSignoutChat();
  }
})

logoutBtn.addEventListener('click', () => {
  signOut(auth)
  .then(() => {
    // console.log("user signed out")
    logedOut();
  })
  .catch(err => {
    // console.log(err.message);
  })
}) 

const logedOut = () => {
  if (!chatSection.classList.contains("hide")) {
    logOutButton.classList.add("hide");
    lognInForm.classList.remove("hide");
    chatSection.classList.add("hide");
  }
}

const showSoChatBtn : HTMLElement | any = document.getElementById("options2");
const soChatBtn : HTMLElement | any = document.getElementById("soChat");

const showSignoutChat = () => {
    soChatBtn.classList.toggle("hide");
}
showSoChatBtn.addEventListener("click", () => {
  showSignoutChat();
})
const signoutChat = async () => {
  const chatID = messageInput.name;
  // console.log(chatID);
  
  await updateDoc(doc(db, "Chats", chatID), {
    leftusers: arrayUnion({
      id: user.uid
    })
  });
  chatroomSection.classList.add('hide');
  chatSection.classList.remove('hide');
}
soChatBtn.addEventListener("click", () => {
  signoutChat();
  
})