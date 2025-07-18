const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Profile</h1>
            <p className="text-gray-400 text-lg">Manage your profile and contribution settings</p>
          </div>

          {/* Content Placeholder */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center">
                <span className="text-white font-bold text-2xl">U</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">User Profile</h2>
              <p className="text-gray-400">Profile content will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 