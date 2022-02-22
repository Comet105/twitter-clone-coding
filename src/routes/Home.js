import React, { useEffect, useState } from "react";
import { dbService, storageService } from "../fbase";
import { ref, uploadString } from "@firebase/storage";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import Tweet from "../components/Tweet";
import { v4 } from "uuid";

function Home({ userObj }) {
  const [tweet, setTweet] = useState("");
  const [tweets, setTweets] = useState([]);
  const [attachment, setAttachment] = useState();

  useEffect(() => {
    const q = query(
      collection(dbService, "tweets"),
      orderBy("createAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      const tweetArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTweets(tweetArr);
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const fileRef = ref(storageService, `${userObj.uid}/${v4()}`);
    const response = await uploadString(fileRef, attachment, "data_url");
    console.log(response);
    // try {
    //   const docRef = await addDoc(collection(dbService, "tweets"), {
    //     text: tweet,
    //     createAt: Date.now(),
    //     creatorId: userObj.uid,
    //   });
    //   console.log("Document written with ID:", docRef.id);
    // } catch (error) {
    //   console.error("Error adding document:", error);
    // }
    // setTweet("");
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setTweet(value);
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };
  const onClearAttachment = () => setAttachment(null);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={tweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Tweet" />
        {attachment && (
          <div>
            <img src={attachment} width="50px" height="50px" />
            <button onClick={onClearAttachment}>Clear</button>
          </div>
        )}
      </form>
      <div>
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweetObj={tweet}
            isOwner={tweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
