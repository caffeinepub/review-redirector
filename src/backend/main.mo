import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let defaultGoogleMapsUrl = "https://maps.google.com";
  let defaultReviews = [
    "Excellent service, highly recommended!",
    "Fast and friendly staff.",
    "Quality work, will return!",
    "Great experience, very professional.",
    "Outstanding service, thank you!",
    "Quick and efficient, no complaints.",
    "Impressive attention to detail.",
    "Superb customer service.",
    "Friendly and helpful team.",
    "Top-notch experience, five stars.",
    "Timely and reliable service.",
    "Very satisfied with the results.",
    "Professional and courteous staff.",
    "Exceeded my expectations!",
    "Highly skilled and knowledgeable team.",
  ];

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var googleMapsUrl : Text = defaultGoogleMapsUrl;
  var reviews : [Text] = defaultReviews;

  // User profile endpoints

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public endpoints

  public query ({ caller }) func getGoogleMapsUrl() : async Text {
    googleMapsUrl;
  };

  public query ({ caller }) func getReviews() : async [Text] {
    reviews;
  };

  // Admin endpoints

  public shared ({ caller }) func updateGoogleMapsUrl(newUrl : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update the Google Maps URL");
    };
    googleMapsUrl := newUrl;
  };

  public shared ({ caller }) func updateReviews(newReviews : [Text]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update reviews");
    };
    reviews := newReviews;
  };

  public shared ({ caller }) func resetGoogleMapsUrl() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset the Google Maps URL");
    };
    googleMapsUrl := defaultGoogleMapsUrl;
  };

  public shared ({ caller }) func resetReviews() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset reviews");
    };
    reviews := defaultReviews;
  };
};
