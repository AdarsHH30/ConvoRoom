const generateRandomUsername = () => {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Curious', 'Gentle', 'Witty', 'Calm', 'Lively', 
                      'Bright', 'Bold', 'Kind', 'Smart', 'Quick', 'Wise', 'Proud'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Lion', 'Falcon',
                 'Rabbit', 'Turtle', 'Owl', 'Hawk', 'Bear', 'Deer', 'Koala'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`;
};

export const getUserIdentity = () => {
  let username = localStorage.getItem('convoroom_username');
  
  if (!username) {
    username = generateRandomUsername();
    while (localStorage.getItem(username)) {
      username = generateRandomUsername();
    }
    localStorage.setItem(username, true);
    localStorage.setItem('convoroom_username', username);
    //console.log('Created new username:', username);
  } else {
    //console.log('Found existing username:', username);
  }
  
  return { username };
};