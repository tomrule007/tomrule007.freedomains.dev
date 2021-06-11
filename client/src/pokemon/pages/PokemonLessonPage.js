import React, { useEffect, useState } from 'react';

import { sendQuery } from '../utilities';

const getUserInfo = () =>
  sendQuery(`{
    user {name, image, lessons {title}},
    lessons {title}
  }`);

const PokemonLoggedInPage = () => {
  const [{ user, lessons }, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInfo().then((results) => {
      setUserInfo(results);
      setLoading(false);
    });
  }, []);

  const unenrolledLessons =
    !loading &&
    lessons.filter(
      (lesson) => !user.lessons.some(({ title }) => title === lesson.title)
    );

  const handleEnroll = (title) => {
    sendQuery(`mutation {enroll(title: "${title}") {name}}`)
      .then(getUserInfo)
      .then(setUserInfo);
  };

  const handleUnenroll = (title) => {
    sendQuery(`mutation {unenroll(title: "${title}") {name}}`)
      .then(getUserInfo)
      .then(setUserInfo);
  };

  return (
    !loading && (
      <div>
        <h1>{user.name}</h1>
        <img src={user.image} />

        <hr />
        {!user.lessons.length ? null : (
          <div className="enrolledSection">
            <h2>Enrolled</h2>
            <p>Click to unenroll</p>
            {user.lessons.map(({ title }, i) => (
              <h4 key={i} onClick={() => handleUnenroll(title)}>
                {title}
              </h4>
            ))}
          </div>
        )}
        <hr />
        {!unenrolledLessons.length ? null : (
          <div className="notEnrolledSection">
            <h2>Not Enrolled</h2>
            <p>Click to enroll</p>
            {unenrolledLessons.map(({ title }, i) => (
              <h4 key={i} onClick={() => handleEnroll(title)}>
                {title}
              </h4>
            ))}
          </div>
        )}
      </div>
    )
  );
};

export default PokemonLoggedInPage;
