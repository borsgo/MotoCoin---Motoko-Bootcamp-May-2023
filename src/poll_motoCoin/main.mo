import Result "mo:base/Result";
import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor {

    type Response = {
        lret : Bool;
        value : Text;
    };

    let ledger = TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);
    
    let transaction = TrieMap.TrieMap<Text, Text>(Text.equal, Text.hash);
    
    let tokenName : Text = "MotoCoin";
    let tokenSymbol : Text = "MOC";

    let mbcCanister : actor {
        getAllStudentsPrincipal : shared () -> async [Principal];
    } = actor("rww3b-zqaaa-aaaam-abioa-cai"); 

    public query func name() : async Text {
        return tokenName;
    };

    public query func symbol() : async Text {
        return tokenSymbol;
    };

    public func totalSupply() : async Nat {
        var total : Nat = 0;
        if(ledger.size() > 0){
            for(value in ledger.vals()){
                total := Nat.add(total, value);
            };
        };
        return total;
    };

    public func getRandom(rnd : Int) : async Response {
        try{
            let arr : [Principal] = await mbcCanister.getAllStudentsPrincipal();
         
            if(arr.size() <= 0){
                return(let res : Response = {lret = false; value = "ID table empty";});
            };
            var count : Int = 0;
            var txtSent : Text = "";
            for (elem in arr.vals()){
                if(count==rnd){
                    txtSent := Principal.toText(elem);
                };
                count += 1;
            };

            return return(let res : Response = {lret = true; value = txtSent});
        }
        catch(e){
            return(let res : Response = {lret = false; value = Error.message(e);});
        }
    };

    public func balanceOf(p : Text) : async Response {
        try{
            if(p.size()!=63){
                return (let res : Response = {lret = false; value = "pID invalid size";})
            };
            let account : Principal = Principal.fromText(p);
            var bal : Nat = 0;
            var getAcc : ?Nat = ledger.get(account);

            switch(getAcc) {
                case(?getAcc) { 
                    bal := getAcc; 
                    return (let res : Response = {lret = true; value = Nat.toText(bal);});  
                };
                case(_)
                {
                    ledger.put(account,1000);
                    return (let res : Response = {lret = true; value = "Welcome your pID was registered. You have 1000";});
                }
            };
        }
        catch(e){
            return(let res : Response = {lret = false; value = Error.message(e);});
        }
    };

    public shared func transfer(from : Text, to : Text, amount : Nat) : async Response {
        try{
            if(to.size()!=63){
                return (let res : Response = {lret = false; value = "Recipient's account, invalid size";})
            };
            if(Text.equal(from, to)){
                return (let res : Response = {lret = false; value = "Sender's account is the same that Recipient's account";});
            };
            var getFrom : ?Nat = ledger.get(let account : Principal = Principal.fromText(from));
            var getTo : ?Nat = ledger.get(let account : Principal = Principal.fromText(to));
            switch(getFrom) {
                case(null) {
                    return return (let res : Response = {lret = false; value = "Sender's account don't exist";});
                };
                case(?getFrom) { 
                    if(getFrom < amount){
                        return (let res : Response = {lret = false; value = "Sender's account has not enough token";});
                    };
                    switch(getTo){
                        case(null){
                            return (let res : Response = {lret = false; value = "Recipient's account don't exist";});
                        };
                        case(?getTo){
                            let oldValFrom = ledger.replace(let account : Principal = Principal.fromText(from), (getFrom - amount));
                            let oldValTo = ledger.replace(let account : Principal = Principal.fromText(to), (getTo + amount));
                            return await insertTransaction(from, to, amount);
                        }
                    };
                };
            };
            
        }
        catch(e){
            return (let res : Response = {lret = false; value = "Ecxeption error:" # Error.message(e);});
        }
    };

    private func insertTransaction(from : Text, to : Text,  amount : Nat) : async Response {
        try{
            let txt : Text =  from # ";" # to # ";" # Nat.toText(amount) ;
            transaction.put(Int.toText(Time.now()), txt);

            let res : Response = await balanceOf(from);
            return res;
        }
        catch(e){
            return(let res : Response = {lret = false; value = Error.message(e);});
        }
    };

    public func getTransaction(from : Text) : async Response {
        try{
            if(transaction.size() <= 0){
                return(let res : Response = {lret = false; value = "Do not have transactions";});
            };
            var txtSent : Text = "";
            for (elem in transaction.vals()){
                var arr = Iter.toArray(Text.split(elem, #char ';'));
                if(arr[0]==from){
                    txtSent := txtSent # (arr[2] # " MOC sent to " # arr[1] # "\n"); 
                };
                if(arr[1]==from){
                    txtSent := txtSent # (arr[2] # " MOC receive from " # arr[0] # "\n");
                }
            };

            return return(let res : Response = {lret = true; value = txtSent});

        }
        catch(e){
            return(let res : Response = {lret = false; value = Error.message(e);});
        }
    };
    
    public func airdrop() : async Result.Result<(), Text> {
        try{
            let arr : [Principal] = await mbcCanister.getAllStudentsPrincipal();
         
            if(arr.size() <= 0){
                return #err("not data bring from the canister");
            };
            for (elem in arr.vals()){
                let acc : Principal = elem;
    
                let ledGet : ?Nat = ledger.get(acc);
                if(ledGet==null){
                    ledger.put(acc,1000);
                };
            };
            return #ok;
        }
        catch(e){
            return #err("Ecxeption error:" # Error.message(e));
        }
        
    };
};

