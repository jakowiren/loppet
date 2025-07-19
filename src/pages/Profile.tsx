import { useParams } from "react-router-dom";

const Profile = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profile: {username}</h1>
        <p className="text-gray-400">User profile page will be implemented here.</p>
      </div>
    </div>
  );
};

export default Profile; 