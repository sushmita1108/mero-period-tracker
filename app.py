import re
from datetime import date, datetime

from flask import Flask, redirect, render_template, request, session, url_for

app = Flask(__name__)
app.config["SECRET_KEY"] = "cycle-development-key"
COUNTRY_OPTIONS = [
    ("🇦🇫", "Afghanistan", "+93"), ("🇦🇱", "Albania", "+355"), ("🇩🇿", "Algeria", "+213"), ("🇦🇩", "Andorra", "+376"), ("🇦🇴", "Angola", "+244"),
    ("🇦🇬", "Antigua and Barbuda", "+1"), ("🇦🇷", "Argentina", "+54"), ("🇦🇲", "Armenia", "+374"), ("🇦🇺", "Australia", "+61"), ("🇦🇹", "Austria", "+43"),
    ("🇦🇿", "Azerbaijan", "+994"), ("🇧🇸", "Bahamas", "+1"), ("🇧🇭", "Bahrain", "+973"), ("🇧🇩", "Bangladesh", "+880"), ("🇧🇧", "Barbados", "+1"),
    ("🇧🇾", "Belarus", "+375"), ("🇧🇪", "Belgium", "+32"), ("🇧🇿", "Belize", "+501"), ("🇧🇯", "Benin", "+229"), ("🇧🇹", "Bhutan", "+975"),
    ("🇧🇴", "Bolivia", "+591"), ("🇧🇦", "Bosnia and Herzegovina", "+387"), ("🇧🇼", "Botswana", "+267"), ("🇧🇷", "Brazil", "+55"), ("🇧🇳", "Brunei", "+673"),
    ("🇧🇬", "Bulgaria", "+359"), ("🇧🇫", "Burkina Faso", "+226"), ("🇧🇮", "Burundi", "+257"), ("🇨🇻", "Cabo Verde", "+238"), ("🇰🇭", "Cambodia", "+855"),
    ("🇨🇲", "Cameroon", "+237"), ("🇨🇦", "Canada", "+1"), ("🇨🇫", "Central African Republic", "+236"), ("🇹🇩", "Chad", "+235"), ("🇨🇱", "Chile", "+56"),
    ("🇨🇳", "China", "+86"), ("🇨🇴", "Colombia", "+57"), ("🇰🇲", "Comoros", "+269"), ("🇨🇬", "Congo", "+242"), ("🇨🇷", "Costa Rica", "+506"),
    ("🇨🇮", "Cote d'Ivoire", "+225"), ("🇭🇷", "Croatia", "+385"), ("🇨🇺", "Cuba", "+53"), ("🇨🇾", "Cyprus", "+357"), ("🇨🇿", "Czechia", "+420"),
    ("🇨🇩", "Democratic Republic of the Congo", "+243"), ("🇩🇰", "Denmark", "+45"), ("🇩🇯", "Djibouti", "+253"), ("🇩🇲", "Dominica", "+1"), ("🇩🇴", "Dominican Republic", "+1"),
    ("🇪🇨", "Ecuador", "+593"), ("🇪🇬", "Egypt", "+20"), ("🇸🇻", "El Salvador", "+503"), ("🇬🇶", "Equatorial Guinea", "+240"), ("🇪🇷", "Eritrea", "+291"),
    ("🇪🇪", "Estonia", "+372"), ("🇸🇿", "Eswatini", "+268"), ("🇪🇹", "Ethiopia", "+251"), ("🇫🇯", "Fiji", "+679"), ("🇫🇮", "Finland", "+358"),
    ("🇫🇷", "France", "+33"), ("🇬🇦", "Gabon", "+241"), ("🇬🇲", "Gambia", "+220"), ("🇬🇪", "Georgia", "+995"), ("🇩🇪", "Germany", "+49"),
    ("🇬🇭", "Ghana", "+233"), ("🇬🇷", "Greece", "+30"), ("🇬🇩", "Grenada", "+1"), ("🇬🇹", "Guatemala", "+502"), ("🇬🇳", "Guinea", "+224"),
    ("🇬🇼", "Guinea-Bissau", "+245"), ("🇬🇾", "Guyana", "+592"), ("🇭🇹", "Haiti", "+509"), ("🇭🇳", "Honduras", "+504"), ("🇭🇺", "Hungary", "+36"),
    ("🇮🇸", "Iceland", "+354"), ("🇮🇳", "India", "+91"), ("🇮🇩", "Indonesia", "+62"), ("🇮🇷", "Iran", "+98"), ("🇮🇶", "Iraq", "+964"),
    ("🇮🇪", "Ireland", "+353"), ("🇮🇱", "Israel", "+972"), ("🇮🇹", "Italy", "+39"), ("🇯🇲", "Jamaica", "+1"), ("🇯🇵", "Japan", "+81"),
    ("🇯🇴", "Jordan", "+962"), ("🇰🇿", "Kazakhstan", "+7"), ("🇰🇪", "Kenya", "+254"), ("🇰🇮", "Kiribati", "+686"), ("🇰🇼", "Kuwait", "+965"),
    ("🇰🇬", "Kyrgyzstan", "+996"), ("🇱🇦", "Laos", "+856"), ("🇱🇻", "Latvia", "+371"), ("🇱🇧", "Lebanon", "+961"), ("🇱🇸", "Lesotho", "+266"),
    ("🇱🇷", "Liberia", "+231"), ("🇱🇾", "Libya", "+218"), ("🇱🇮", "Liechtenstein", "+423"), ("🇱🇹", "Lithuania", "+370"), ("🇱🇺", "Luxembourg", "+352"),
    ("🇲🇬", "Madagascar", "+261"), ("🇲🇼", "Malawi", "+265"), ("🇲🇾", "Malaysia", "+60"), ("🇲🇻", "Maldives", "+960"), ("🇲🇱", "Mali", "+223"),
    ("🇲🇹", "Malta", "+356"), ("🇲🇭", "Marshall Islands", "+692"), ("🇲🇷", "Mauritania", "+222"), ("🇲🇺", "Mauritius", "+230"), ("🇲🇽", "Mexico", "+52"),
    ("🇫🇲", "Micronesia", "+691"), ("🇲🇩", "Moldova", "+373"), ("🇲🇨", "Monaco", "+377"), ("🇲🇳", "Mongolia", "+976"), ("🇲🇪", "Montenegro", "+382"),
    ("🇲🇦", "Morocco", "+212"), ("🇲🇿", "Mozambique", "+258"), ("🇲🇲", "Myanmar", "+95"), ("🇳🇦", "Namibia", "+264"), ("🇳🇷", "Nauru", "+674"),
    ("🇳🇵", "Nepal", "+977"), ("🇳🇱", "Netherlands", "+31"), ("🇳🇿", "New Zealand", "+64"), ("🇳🇮", "Nicaragua", "+505"), ("🇳🇪", "Niger", "+227"),
    ("🇳🇬", "Nigeria", "+234"), ("🇰🇵", "North Korea", "+850"), ("🇲🇰", "North Macedonia", "+389"), ("🇳🇴", "Norway", "+47"), ("🇴🇲", "Oman", "+968"),
    ("🇵🇰", "Pakistan", "+92"), ("🇵🇼", "Palau", "+680"), ("🇵🇸", "Palestine", "+970"), ("🇵🇦", "Panama", "+507"), ("🇵🇬", "Papua New Guinea", "+675"),
    ("🇵🇾", "Paraguay", "+595"), ("🇵🇪", "Peru", "+51"), ("🇵🇭", "Philippines", "+63"), ("🇵🇱", "Poland", "+48"), ("🇵🇹", "Portugal", "+351"),
    ("🇶🇦", "Qatar", "+974"), ("🇷🇴", "Romania", "+40"), ("🇷🇺", "Russia", "+7"), ("🇷🇼", "Rwanda", "+250"), ("🇰🇳", "Saint Kitts and Nevis", "+1"),
    ("🇱🇨", "Saint Lucia", "+1"), ("🇻🇨", "Saint Vincent and the Grenadines", "+1"), ("🇼🇸", "Samoa", "+685"), ("🇸🇲", "San Marino", "+378"), ("🇸🇹", "Sao Tome and Principe", "+239"),
    ("🇸🇦", "Saudi Arabia", "+966"), ("🇸🇳", "Senegal", "+221"), ("🇷🇸", "Serbia", "+381"), ("🇸🇨", "Seychelles", "+248"), ("🇸🇱", "Sierra Leone", "+232"),
    ("🇸🇬", "Singapore", "+65"), ("🇸🇰", "Slovakia", "+421"), ("🇸🇮", "Slovenia", "+386"), ("🇸🇧", "Solomon Islands", "+677"), ("🇸🇴", "Somalia", "+252"),
    ("🇿🇦", "South Africa", "+27"), ("🇰🇷", "South Korea", "+82"), ("🇸🇸", "South Sudan", "+211"), ("🇪🇸", "Spain", "+34"), ("🇱🇰", "Sri Lanka", "+94"),
    ("🇸🇩", "Sudan", "+249"), ("🇸🇷", "Suriname", "+597"), ("🇸🇪", "Sweden", "+46"), ("🇨🇭", "Switzerland", "+41"), ("🇸🇾", "Syria", "+963"),
    ("🇹🇼", "Taiwan", "+886"), ("🇹🇯", "Tajikistan", "+992"), ("🇹🇿", "Tanzania", "+255"), ("🇹🇭", "Thailand", "+66"), ("🇹🇱", "Timor-Leste", "+670"),
    ("🇹🇬", "Togo", "+228"), ("🇹🇴", "Tonga", "+676"), ("🇹🇹", "Trinidad and Tobago", "+1"), ("🇹🇳", "Tunisia", "+216"), ("🇹🇷", "Turkey", "+90"),
    ("🇹🇲", "Turkmenistan", "+993"), ("🇹🇻", "Tuvalu", "+688"), ("🇺🇬", "Uganda", "+256"), ("🇺🇦", "Ukraine", "+380"), ("🇦🇪", "United Arab Emirates", "+971"),
    ("🇬🇧", "United Kingdom", "+44"), ("🇺🇸", "United States", "+1"), ("🇺🇾", "Uruguay", "+598"), ("🇺🇿", "Uzbekistan", "+998"), ("🇻🇺", "Vanuatu", "+678"),
    ("🇻🇦", "Vatican City", "+39"), ("🇻🇪", "Venezuela", "+58"), ("🇻🇳", "Vietnam", "+84"), ("🇾🇪", "Yemen", "+967"), ("🇿🇲", "Zambia", "+260"), ("🇿🇼", "Zimbabwe", "+263"),
]
COUNTRY_CODES = {code for _, _, code in COUNTRY_OPTIONS}

@app.route("/")
def home():
    if session.get("user"):
        return redirect(url_for("dashboard"))
    if session.get("registered_user"):
        return redirect(url_for("login"))
    return redirect(url_for("register"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if session.get("user"):
        return redirect(url_for("dashboard"))

    error = None

    if request.method == "POST":
        full_name = " ".join(request.form.get("full_name", "").split())
        country_code = request.form.get("country_code", "").strip()
        phone = request.form.get("phone", "").strip()
        dob = request.form.get("dob", "").strip()
        phone_digits = re.sub(r"\D", "", phone)

        if not re.fullmatch(r"[A-Za-z][A-Za-z' -]{1,79}", full_name):
            error = "Enter your full name."
        elif country_code not in COUNTRY_CODES:
            error = "Choose your country code."
        elif not re.fullmatch(r"[0-9\s().-]{7,20}", phone) or not 7 <= len(phone_digits) <= 15:
            error = "Enter a valid phone number."
        else:
            try:
                birth_date = datetime.strptime(dob, "%Y-%m-%d").date()
            except ValueError:
                birth_date = None

            today = date.today()
            if not birth_date or birth_date > today:
                error = "Enter a valid date of birth."
            elif (today - birth_date).days // 365 < 13:
                error = "You must be at least 13 to use Cycle."
            else:
                session["registered_user"] = {"full_name": full_name, "country_code": country_code, "phone": phone_digits, "dob": dob}
                session.pop("user", None)
                return redirect(url_for("login", registered="1"))

    return render_template("register.html", error=error, country_options=COUNTRY_OPTIONS)


@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("user"):
        return redirect(url_for("dashboard"))

    error = None
    registered = request.args.get("registered") == "1"
    registered_user = session.get("registered_user")

    if not registered_user:
        return redirect(url_for("register"))

    if request.method == "POST":
        country_code = request.form.get("country_code", "").strip()
        phone = request.form.get("phone", "").strip()
        phone_digits = re.sub(r"\D", "", phone)

        registered_country_code = registered_user.get("country_code", "+1")
        if country_code != registered_country_code or phone_digits != registered_user["phone"]:
            error = "Those details do not match your registration."
        else:
            session["user"] = registered_user
            return redirect(url_for("dashboard"))

    return render_template("login.html", error=error, registered=registered, country_options=COUNTRY_OPTIONS)


@app.route("/dashboard")
def dashboard():
    if not session.get("user"):
        return redirect(url_for("login"))
    return render_template("index.html", user=session["user"])


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
