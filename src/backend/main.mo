import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Types
  public type ToolCondition = {
    #new;
    #gentlyUsed;
    #wellUsed;
    #needsRepair;
  };

  public type ToolCategory = {
    #powerTools;
    #handTools;
    #gardenTools;
    #automotive;
    #specialty;
  };

  public type RentalStatus = {
    #requested;
    #approved;
    #declined;
    #cancelledByOwner;
    #cancelledByRenter;
    #completed;
  };

  public type GeoCoordinates = {
    latitude : Float;
    longitude : Float;
  };

  public type CommunityMapProfile = {
    id : Principal;
    displayName : Text;
    contactInfo : ?Text;
    location : Text;
    profilePicture : Text;
    coordinates : ?GeoCoordinates;
    joinedAt : Time.Time;
  };

  public type UserProfile = {
    id : Principal;
    displayName : Text;
    contactInfo : ?Text;
    location : Text;
    profilePicture : Text;
    coordinates : ?GeoCoordinates;
    joinedAt : Time.Time;
    streetAddress : ?Text;
    publicCoordinates : ?GeoCoordinates;
  };

  public type ToolListing = {
    id : Nat;
    owner : Principal;
    title : Text;
    category : ToolCategory;
    description : Text;
    condition : ToolCondition;
    dailyPrice : Nat;
    securityDeposit : ?Nat;
    location : Text;
    available : Bool;
    photos : [Text];
    created : Time.Time;
  };

  public type RentalRequest = {
    id : Nat;
    toolId : Nat;
    renter : Principal;
    owner : Principal;
    startDate : Time.Time;
    endDate : Time.Time;
    status : RentalStatus;
    created : Time.Time;
    lastUpdated : Time.Time;
  };

  public type ChatMessage = {
    sender : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  module ToolListing {
    public func compareByPriceAsc(a : ToolListing, b : ToolListing) : Order.Order {
      if (a.dailyPrice < b.dailyPrice) { #less } else if (a.dailyPrice > b.dailyPrice) {
        #greater;
      } else { #equal };
    };

    public func compareByPriceDesc(a : ToolListing, b : ToolListing) : Order.Order {
      if (a.dailyPrice > b.dailyPrice) { #less } else if (a.dailyPrice < b.dailyPrice) {
        #greater;
      } else { #equal };
    };

    public func compareByCreatedDesc(a : ToolListing, b : ToolListing) : Order.Order {
      if (a.created > b.created) { #less } else if (a.created < b.created) {
        #greater;
      } else { #equal };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // State
  let profiles = Map.empty<Principal, UserProfile>();
  let tools = Map.empty<Nat, ToolListing>();
  let rentals = Map.empty<Nat, RentalRequest>();
  let rentalChats = Map.empty<Nat, List.List<ChatMessage>>();

  var nextToolId = 1;
  var nextRentalId = 1;

  // User Profile Management
  public shared ({ caller }) func createOrUpdateProfile(
    displayName : Text,
    contactInfo : ?Text,
    location : Text,
    profilePicture : Text,
    coordinates : ?GeoCoordinates,
    streetAddress : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to create/update profile");
    };

    // Generate public coordinates with obfuscated location
    let publicCoordinates = switch (coordinates) {
      case (?coords) { ?generateObfuscatedCoordinates(coords) };
      case (null) { null };
    };

    let existingProfile = profiles.get(caller);

    let profile : UserProfile = {
      id = caller;
      displayName;
      contactInfo;
      location;
      profilePicture;
      coordinates;
      joinedAt = switch (existingProfile) {
        case (null) { Time.now() };
        case (?existing) { existing.joinedAt };
      };
      streetAddress;
      publicCoordinates;
    };

    profiles.add(caller, profile);
  };

  // Generate Obfuscated Coordinates
  func generateObfuscatedCoordinates(coords : GeoCoordinates) : GeoCoordinates {
    let latIntValue = coords.latitude.toInt();
    let lonIntValue = coords.longitude.toInt();

    let latOffset = (Int.abs(latIntValue % 10) % 4 + 2).toInt() * (if (coords.latitude > 0) { 1 } else { -1 });
    let lonOffset = (Int.abs(lonIntValue % 10) % 4 + 2).toInt() * (if (coords.longitude > 0) { 1 } else { -1 });

    let floatLatOffset = latOffset.toFloat();
    let floatLonOffset = lonOffset.toFloat();

    // Random(ish) offset distance
    let obfuscatedLatitude = coords.latitude + (0.005 * floatLatOffset);
    let obfuscatedLongitude = coords.longitude + (0.004 * floatLonOffset);

    {
      latitude = obfuscatedLatitude;
      longitude = obfuscatedLongitude;
    };
  };

  // Get callers full private profile (never public)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  // Get another user's profile - admin can view full profile, regular users cannot view private fields
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    // Only the profile owner or admin can view the full profile including private fields
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own full profile");
    };

    profiles.get(user);
  };

  // Save caller's profile - wrapper for createOrUpdateProfile for frontend compatibility
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    await createOrUpdateProfile(
      profile.displayName,
      profile.contactInfo,
      profile.location,
      profile.profilePicture,
      profile.coordinates,
      profile.streetAddress,
    );
  };

  // Query public location compatible coordinates for community map
  public query ({ caller }) func getCommunityMapProfiles() : async [CommunityMapProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view map");
    };

    let filtered = profiles.values().toArray().filter(
      func(profile) {
        switch (profile.publicCoordinates) {
          case (null) { false };
          case (_) { true };
        };
      }
    );

    // Map to public profiles and return public coordinates only
    let mapped = filtered.map(
      func(profile) {
        {
          id = profile.id;
          displayName = profile.displayName;
          contactInfo = profile.contactInfo;
          location = profile.location;
          profilePicture = profile.profilePicture;
          coordinates = profile.publicCoordinates;
          joinedAt = profile.joinedAt;
        };
      }
    );

    mapped;
  };

  // Tool Listing Management
  public shared ({ caller }) func addToolListing(title : Text, category : ToolCategory, description : Text, condition : ToolCondition, dailyPrice : Nat, securityDeposit : ?Nat, location : Text, photos : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to add a tool");
    };

    let listing : ToolListing = {
      id = nextToolId;
      owner = caller;
      title;
      category;
      description;
      condition;
      dailyPrice;
      securityDeposit;
      location;
      available = true;
      photos;
      created = Time.now();
    };

    tools.add(nextToolId, listing);
    let toolId = nextToolId;
    nextToolId += 1;

    toolId;
  };

  public shared ({ caller }) func editToolListing(toolId : Nat, title : Text, category : ToolCategory, description : Text, condition : ToolCondition, dailyPrice : Nat, securityDeposit : ?Nat, location : Text, available : Bool, photos : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to edit listing");
    };

    let existing = switch (tools.get(toolId)) {
      case (null) { Runtime.trap("Tool not found") };
      case (?tool) { tool };
    };

    if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the tool owner can edit this listing");
    };

    let updated : ToolListing = {
      id = toolId;
      owner = existing.owner;
      title;
      category;
      description;
      condition;
      dailyPrice;
      securityDeposit;
      location;
      available;
      photos;
      created = existing.created;
    };

    tools.add(toolId, updated);
  };

  public query ({ caller }) func getTool(toolId : Nat) : async ?ToolListing {
    tools.get(toolId);
  };

  public query ({ caller }) func getToolsByOwner(owner : Principal) : async [ToolListing] {
    let iter = tools.values().filter(func(t) { t.owner == owner });
    iter.toArray();
  };

  public query ({ caller }) func searchTools(searchText : ?Text, category : ?ToolCategory, minPrice : ?Nat, maxPrice : ?Nat, availableOnly : Bool, sortBy : Text) : async [ToolListing] {
    let filtered = tools.values().filter(
      func(t) {
        let matchesText = switch (searchText) {
          case (null) { true };
          case (?search) {
            t.title.toLower().contains(#text(search.toLower())) or t.description.toLower().contains(#text(search.toLower()));
          };
        };

        let matchesCategory = switch (category) {
          case (null) { true };
          case (?cat) { t.category == cat };
        };

        let matchesMinPrice = switch (minPrice) {
          case (null) { true };
          case (?min) { t.dailyPrice >= min };
        };

        let matchesMaxPrice = switch (maxPrice) {
          case (null) { true };
          case (?max) { t.dailyPrice <= max };
        };

        let matchesAvailability = if (availableOnly) { t.available } else { true };

        matchesText and matchesCategory and matchesMinPrice and matchesMaxPrice and matchesAvailability
      }
    );

    let filteredArray = filtered.toArray();

    if (filteredArray.size() == 0) {
      return [];
    };

    switch (sortBy) {
      case ("newest") {
        filteredArray.sort(ToolListing.compareByCreatedDesc);
      };
      case ("priceAsc") {
        filteredArray.sort(ToolListing.compareByPriceAsc);
      };
      case ("priceDesc") {
        filteredArray.sort(ToolListing.compareByPriceDesc);
      };
      case (_) { filteredArray };
    };
  };

  // Rental/Booking Management
  public shared ({ caller }) func requestRental(toolId : Nat, startDate : Time.Time, endDate : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to request rental");
    };

    let tool = switch (tools.get(toolId)) {
      case (null) { Runtime.trap("Tool not found") };
      case (?tool) { tool };
    };

    if (tool.owner == caller) {
      Runtime.trap("Cannot rent your own tool");
    };

    if (not tool.available) {
      Runtime.trap("Tool is currently not available");
    };

    let rentalRequest : RentalRequest = {
      id = nextRentalId;
      toolId;
      renter = caller;
      owner = tool.owner;
      startDate;
      endDate;
      status = #requested;
      created = Time.now();
      lastUpdated = Time.now();
    };

    rentals.add(nextRentalId, rentalRequest);
    let rentalId = nextRentalId;
    nextRentalId += 1;

    rentalId;
  };

  public shared ({ caller }) func updateRentalStatus(rentalId : Nat, newStatus : RentalStatus, _comments : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to update rental status");
    };

    let rental = switch (rentals.get(rentalId)) {
      case (null) { Runtime.trap("Rental request not found") };
      case (?rental) { rental };
    };

    // Permission and valid transition check
    let isOwner = rental.owner == caller;
    let isRenter = rental.renter == caller;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    switch (rental.status, newStatus) {
      case (#requested, #approved) {
        if (not (isOwner or isAdmin)) { Runtime.trap("Unauthorized: Only the tool owner can approve requests") };
      };
      case (#requested, #declined) {
        if (not (isOwner or isAdmin)) { Runtime.trap("Unauthorized: Only the tool owner can decline requests") };
      };
      case (#requested, #cancelledByRenter) {
        if (not (isRenter or isAdmin)) { Runtime.trap("Unauthorized: Only the renter can cancel request") };
      };
      case (#approved, #cancelledByOwner) {
        if (not (isOwner or isAdmin)) { Runtime.trap("Unauthorized: Only the owner can cancel approved rentals") };
      };
      case (#approved, #completed) {
        if (not (isOwner or isRenter or isAdmin)) {
          Runtime.trap("Unauthorized: Only owner or renter can complete rental");
        };
      };
      case (#approved, #cancelledByRenter) {
        if (not (isRenter or isAdmin)) { Runtime.trap("Unauthorized: Only the renter can cancel rental") };
      };
      case (_) { Runtime.trap("Invalid status transition") };
    };

    let updatedRental : RentalRequest = {
      id = rental.id;
      toolId = rental.toolId;
      renter = rental.renter;
      owner = rental.owner;
      startDate = rental.startDate;
      endDate = rental.endDate;
      status = newStatus;
      created = rental.created;
      lastUpdated = Time.now();
    };

    rentals.add(rentalId, updatedRental);

    // If approved, block tool availability
    if (newStatus == #approved) {
      let tool = switch (tools.get(rental.toolId)) {
        case (null) { Runtime.trap("Tool not found") };
        case (?tool) { tool };
      };
      let updatedTool : ToolListing = {
        id = tool.id;
        owner = tool.owner;
        title = tool.title;
        category = tool.category;
        description = tool.description;
        condition = tool.condition;
        dailyPrice = tool.dailyPrice;
        securityDeposit = tool.securityDeposit;
        location = tool.location;
        available = false;
        photos = tool.photos;
        created = tool.created;
      };
      tools.add(tool.id, updatedTool);
    };
  };

  public query ({ caller }) func getRentalsForUser() : async { owned : [RentalRequest]; rented : [RentalRequest] } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view rentals");
    };

    let owned = List.empty<RentalRequest>();
    let rented = List.empty<RentalRequest>();

    rentals.values().forEach(
      func(r) {
        if (r.owner == caller) { owned.add(r) };
        if (r.renter == caller) { rented.add(r) };
      }
    );

    {
      owned = owned.toArray();
      rented = rented.toArray();
    };
  };

  public query ({ caller }) func getToolAvailability(toolId : Nat) : async Bool {
    switch (tools.get(toolId)) {
      case (null) { Runtime.trap("Tool not found") };
      case (?tool) { tool.available };
    };
  };

  // Rental Chat Functionality
  public shared ({ caller }) func sendRentalMessage(rentalId : Nat, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to send messages");
    };

    let rental = switch (rentals.get(rentalId)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?rental) { rental };
    };

    // Allow the rental's renter/owner (or admin) to send messages
    if ((rental.owner != caller and rental.renter != caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only send chat messages for your own rentals");
    };

    let newMessage : ChatMessage = {
      sender = caller;
      message;
      timestamp = Time.now();
    };

    // Get the existing messages for the rental or create a new empty list
    let chatMessages : List.List<ChatMessage> = switch (rentalChats.get(rentalId)) {
      case (null) { List.empty<ChatMessage>() };
      case (?list) { list };
    };

    chatMessages.add(newMessage);

    rentalChats.add(rentalId, chatMessages);
  };

  public query ({ caller }) func getRentalMessages(rentalId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view messages");
    };

    let rental = switch (rentals.get(rentalId)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?rental) { rental };
    };

    // Only allow access to rental's renter/owner (or admin)
    if ((rental.owner != caller and rental.renter != caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view chat messages for your own rentals");
    };

    // Find the messages for the rental, default to empty list if none exists
    let messages = switch (rentalChats.get(rentalId)) {
      case (null) { List.empty<ChatMessage>() };
      case (?list) { list };
    };

    // Convert messages to array and reverse them to show most recent first
    let messagesArray = messages.toArray();
    messagesArray.reverse();
  };
};

