function handleSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    const data = {
        email,
        subject,
        message
    };

    fetch("/contact?sendEmail", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }).then(body => body.json()).then(res => {
        if (res.status === "ok") {
            clearFields();
            alert("Successfully sent email!");
        } else {
            var errorDiv = document.createElement("DIV");
            errorDiv.classList.add("center");
            errorDiv.style.float = "right";
            errorDiv.style.margin = "auto 30% auto 30%";
            errorDiv.style.backgroundColor = "#ffcccc";
            errorDiv.style.border = "2px solid #ff3333";
            errorDiv.style.width = "50%;";
            errorDiv.id = "error";
            var errorSpan = document.createElement("SPAN");
            errorSpan.classList.add("center");
            errorSpan.style.margin = "50% 10px 10px 10px;";
            errorSpan.style.width = "50%;";
            errorSpan.style.color = "black";
            errorSpan.innerHTML = res.error;
            errorDiv.appendChild(errorSpan);
            if (!document.getElementById("error")) document.querySelector("form").appendChild(errorDiv);
            else {
                document.getElementById("error").innerHTML = res.error;
                document.getElementById("error").style.color = "black";
            }
        }
    });
}

function clearFields() {
    var email = document.getElementById("email");
    var subject = document.getElementById("subject");
    var message = document.getElementById("message");
    email.value = "";
    subject.value = "";
    message.value = "";
}