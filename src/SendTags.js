import React, {useState} from 'react'
import './SendTags.css';

// { 'Human Torch': ['hero', 'mutant', 'tough', 'dumb', 'tall'], \
// 'Spiderman': ['hero', 'tough', 'smart', 'tall'], 'Kyle': ['human', 'weak', 'smart', 'short'], 
// 'JonJon': ['human', 'strong', 'smart', 'tall', 'weird'] }

export default function SendTags () {
    const [recipients, updateRecipients] = useState("")
    const [tags, updateTags] = useState("")
    const [config, updateConfig] = useState("")
    const [sendTo, updateSendTo] = useState("")
    const [sendType, updateSendType] = useState("")
    const [sent, updateSent] = useState(false)
    const [error, updateError] = useState("")
    const [errorMsg, updateErrorMsg] = useState("")
    const errorTimeout = 3000;

    const handleChange = (event) => {
        const value = event.target.value
        switch(event.target.name) {
            case "tags":
                let formattedTags = value.split(',').map( (t) =>  t.trim() )
                updateTags(formattedTags)
                return
            case "config":
                // Semi confident JSON parsing
                try{
                    let reformedVal = value.replace(/“/g, '"')
                                            .replace(/”/g, '"')
                                            .replace(/'/g, '"');
                    let jsonVal = JSON.parse(reformedVal);
                    updateConfig(jsonVal)
                    return
                } catch (e) {
                    console.error(e);
                    console.error("Invalid JSON");
                    showError("Invalid person json");
                    updateConfig({})
                    return
                }
            case "sendTo":
                let formattedSendTos = value.split(',').map( (t) =>  t.trim() )
                updateSendTo(formattedSendTos)
                return
            case "sendType":
                if (value.toLowerCase() !== "and" && value.toLowerCase() !== "or") {
                    console.error("Defaulting to AND");
                    updateSendType("AND");
                    return;
                } else {
                    updateSendType(value.toUpperCase())
                    return
                }
            default:
                return;
        }
    }

    const refreshError = () => {
        setTimeout( () => {
            updateError(false)
        }, errorTimeout)
    }

    const showError = (msg) => {
        updateError(true);
        refreshError();
        updateErrorMsg(msg);
    }

    const validateInput = () => {
        const hypotheticalLoggerOn = true;
        if (hypotheticalLoggerOn) {
            console.log("Tags ", tags);
            console.log("People ", config);
            console.log("Send To ", sendTo);
            console.log("Send Type ", sendType);
        }

        if (!tags || tags.length === 0) {
            showError("No tags provided");
            return false;
        }
        if (!config) {
            showError('No people specified');
            return false;
        }
        if (!sendTo || sendTo.length === 0) {
            showError('No send to tags specified');
            return false;
        }
        if (!sendType || (sendType !== "AND" && sendType !== "OR") ) {
            showError('No send type specified');
            return false;
        }
        return true;
    }

    const hasAllNeededTags = (personTags) => {
        for (var i = 0; i < sendTo.length; i++) {
            let neededTag = sendTo[i];
            if (!personTags.includes(neededTag)) {
                return false;
            }
        }
        return true;
    }

    const hasOneNeededTag = (personTags) => {
        for (var i = 0; i < tags.length; i++) { // Iterate over possible tags
            let tag = tags[i]
            if (personTags.includes(tag) && sendTo.includes(tag) ) {
                return true;
            }
        }
        return false;
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        updateSent(false);

        if(!validateInput())
            return;

        let sendList = [];
        const peopleKeys = Object.keys(config);

        peopleKeys.forEach( (key, index) => { // Iterate over possible recipients
            let person = config[key];
            if (sendType === "OR" && hasOneNeededTag(person)) {
                sendList.push(key);
            } else if (sendType === "AND"  && hasAllNeededTags(person)) {
                sendList.push(key);
            }
        })

        updateRecipients(sendList.join(", "));

        if(sendList.length > 0){
            updateSent(true);
        } else {
            showError('No people match those tags');
        }

    }

    return (
        <div className="SendTags">
            { error && <div className="SendTags-error">Whoops: {errorMsg}</div> }
            <form onSubmit={handleSubmit} style={{textAlign: "left"}}>
                <label style={{paddingRight: "10px"}}>
                    <div className="formRow">
                        <span style={{paddingRight: "10px"}}>Acceptable Tags:</span>
                        <br />
                        <input type="text" name="tags" placeholder="Hero, tough, mutant" onChange={handleChange}/>
                    </div>
                    <div className="formRow">
                        <p style={{margin: '0px 0 4px 0'}} > People's Tags </p>
                        <textarea placeholder="{'Spiderman': ['hero', 'tough', 'smart”, 'tall']}" 
                                    type="text" name="config" style={{width: '100%', height: '70px'}} onChange={handleChange}
                            />
                    </div>
                    <div className="formRow">
                        <span style={{paddingRight: "10px", paddingTop: "20px"}}>Send To:</span>
                        <input type="text" placeholder="Hero, tough" name="sendTo" onChange={handleChange}/>
                    </div>
                    <div className="formRow">
                        <span style={{paddingRight: "10px", paddingTop: "20px"}}>AND/OR?: </span>
                        <input type="text" name="sendType" placeholder="AND/OR (default AND)" onChange={handleChange}/>
                    </div>
                </label>
                <button className="submitButton" type="submit">Send Messages</button>
            </form>
            { sent && <div>Sent to: {recipients}</div> }
        </div>
    )
}