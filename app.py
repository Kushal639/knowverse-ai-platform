!pip -q install streamlit pyngrok pandas spacy networkx pyvis sentence-transformers
!python -m spacy download en_core_web_sm
!pip install streamlit-option-menu

     
Collecting en-core-web-sm==3.8.0
  Downloading https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl (12.8 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12.8/12.8 MB 32.5 MB/s eta 0:00:00
✔ Download and installation successful
You can now load the package via spacy.load('en_core_web_sm')
⚠ Restart to reload dependencies
If you are in a Jupyter or Colab notebook, you may need to restart Python in
order to load all the package's dependencies. You can do this by selecting the
'Restart kernel' or 'Restart runtime' option.
Requirement already satisfied: streamlit-option-menu in /usr/local/lib/python3.12/dist-packages (0.4.0)
Requirement already satisfied: streamlit>=1.36 in /usr/local/lib/python3.12/dist-packages (from streamlit-option-menu) (1.51.0)
Requirement already satisfied: altair!=5.4.0,!=5.4.1,<6,>=4.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (5.5.0)
Requirement already satisfied: blinker<2,>=1.5.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (1.9.0)
Requirement already satisfied: cachetools<7,>=4.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (5.5.2)
Requirement already satisfied: click<9,>=7.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (8.3.0)
Requirement already satisfied: numpy<3,>=1.23 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (2.0.2)
Requirement already satisfied: packaging<26,>=20 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (25.0)
Requirement already satisfied: pandas<3,>=1.4.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (2.2.2)
Requirement already satisfied: pillow<13,>=7.1.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (11.3.0)
Requirement already satisfied: protobuf<7,>=3.20 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (5.29.5)
Requirement already satisfied: pyarrow<22,>=7.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (18.1.0)
Requirement already satisfied: requests<3,>=2.27 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (2.32.4)
Requirement already satisfied: tenacity<10,>=8.1.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (8.5.0)
Requirement already satisfied: toml<2,>=0.10.1 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (0.10.2)
Requirement already satisfied: typing-extensions<5,>=4.4.0 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (4.15.0)
Requirement already satisfied: watchdog<7,>=2.1.5 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (6.0.0)
Requirement already satisfied: gitpython!=3.1.19,<4,>=3.0.7 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (3.1.45)
Requirement already satisfied: pydeck<1,>=0.8.0b4 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (0.9.1)
Requirement already satisfied: tornado!=6.5.0,<7,>=6.0.3 in /usr/local/lib/python3.12/dist-packages (from streamlit>=1.36->streamlit-option-menu) (6.5.1)
Requirement already satisfied: jinja2 in /usr/local/lib/python3.12/dist-packages (from altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (3.1.6)
Requirement already satisfied: jsonschema>=3.0 in /usr/local/lib/python3.12/dist-packages (from altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (4.25.1)
Requirement already satisfied: narwhals>=1.14.2 in /usr/local/lib/python3.12/dist-packages (from altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (2.10.0)
Requirement already satisfied: gitdb<5,>=4.0.1 in /usr/local/lib/python3.12/dist-packages (from gitpython!=3.1.19,<4,>=3.0.7->streamlit>=1.36->streamlit-option-menu) (4.0.12)
Requirement already satisfied: python-dateutil>=2.8.2 in /usr/local/lib/python3.12/dist-packages (from pandas<3,>=1.4.0->streamlit>=1.36->streamlit-option-menu) (2.9.0.post0)
Requirement already satisfied: pytz>=2020.1 in /usr/local/lib/python3.12/dist-packages (from pandas<3,>=1.4.0->streamlit>=1.36->streamlit-option-menu) (2025.2)
Requirement already satisfied: tzdata>=2022.7 in /usr/local/lib/python3.12/dist-packages (from pandas<3,>=1.4.0->streamlit>=1.36->streamlit-option-menu) (2025.2)
Requirement already satisfied: charset_normalizer<4,>=2 in /usr/local/lib/python3.12/dist-packages (from requests<3,>=2.27->streamlit>=1.36->streamlit-option-menu) (3.4.4)
Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.12/dist-packages (from requests<3,>=2.27->streamlit>=1.36->streamlit-option-menu) (3.11)
Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/lib/python3.12/dist-packages (from requests<3,>=2.27->streamlit>=1.36->streamlit-option-menu) (2.5.0)
Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.12/dist-packages (from requests<3,>=2.27->streamlit>=1.36->streamlit-option-menu) (2025.10.5)
Requirement already satisfied: smmap<6,>=3.0.1 in /usr/local/lib/python3.12/dist-packages (from gitdb<5,>=4.0.1->gitpython!=3.1.19,<4,>=3.0.7->streamlit>=1.36->streamlit-option-menu) (5.0.2)
Requirement already satisfied: MarkupSafe>=2.0 in /usr/local/lib/python3.12/dist-packages (from jinja2->altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (3.0.3)
Requirement already satisfied: attrs>=22.2.0 in /usr/local/lib/python3.12/dist-packages (from jsonschema>=3.0->altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (25.4.0)
Requirement already satisfied: jsonschema-specifications>=2023.03.6 in /usr/local/lib/python3.12/dist-packages (from jsonschema>=3.0->altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (2025.9.1)
Requirement already satisfied: referencing>=0.28.4 in /usr/local/lib/python3.12/dist-packages (from jsonschema>=3.0->altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (0.37.0)
Requirement already satisfied: rpds-py>=0.7.1 in /usr/local/lib/python3.12/dist-packages (from jsonschema>=3.0->altair!=5.4.0,!=5.4.1,<6,>=4.0->streamlit>=1.36->streamlit-option-menu) (0.28.0)
Requirement already satisfied: six>=1.5 in /usr/local/lib/python3.12/dist-packages (from python-dateutil>=2.8.2->pandas<3,>=1.4.0->streamlit>=1.36->streamlit-option-menu) (1.17.0)

!pip install pyvis==0.2.1
     
Requirement already satisfied: pyvis==0.2.1 in /usr/local/lib/python3.12/dist-packages (0.2.1)
Requirement already satisfied: jinja2>=2.9.6 in /usr/local/lib/python3.12/dist-packages (from pyvis==0.2.1) (3.1.6)
Requirement already satisfied: networkx>=1.11 in /usr/local/lib/python3.12/dist-packages (from pyvis==0.2.1) (3.5)
Requirement already satisfied: ipython>=5.3.0 in /usr/local/lib/python3.12/dist-packages (from pyvis==0.2.1) (7.34.0)
Requirement already satisfied: jsonpickle>=1.4.1 in /usr/local/lib/python3.12/dist-packages (from pyvis==0.2.1) (4.1.1)
Requirement already satisfied: setuptools>=18.5 in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (75.2.0)
Requirement already satisfied: jedi>=0.16 in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (0.19.2)
Requirement already satisfied: decorator in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (4.4.2)
Requirement already satisfied: pickleshare in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (0.7.5)
Requirement already satisfied: traitlets>=4.2 in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (5.7.1)
Requirement already satisfied: prompt-toolkit!=3.0.0,!=3.0.1,<3.1.0,>=2.0.0 in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (3.0.52)
Requirement already satisfied: pygments in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (2.19.2)
Requirement already satisfied: backcall in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (0.2.0)
Requirement already satisfied: matplotlib-inline in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (0.2.1)
Requirement already satisfied: pexpect>4.3 in /usr/local/lib/python3.12/dist-packages (from ipython>=5.3.0->pyvis==0.2.1) (4.9.0)
Requirement already satisfied: MarkupSafe>=2.0 in /usr/local/lib/python3.12/dist-packages (from jinja2>=2.9.6->pyvis==0.2.1) (3.0.3)
Requirement already satisfied: parso<0.9.0,>=0.8.4 in /usr/local/lib/python3.12/dist-packages (from jedi>=0.16->ipython>=5.3.0->pyvis==0.2.1) (0.8.5)
Requirement already satisfied: ptyprocess>=0.5 in /usr/local/lib/python3.12/dist-packages (from pexpect>4.3->ipython>=5.3.0->pyvis==0.2.1) (0.7.0)
Requirement already satisfied: wcwidth in /usr/local/lib/python3.12/dist-packages (from prompt-toolkit!=3.0.0,!=3.0.1,<3.1.0,>=2.0.0->ipython>=5.3.0->pyvis==0.2.1) (0.2.14)

%%writefile app.py
     
Overwriting app.py

!ls -lh app.py
     
-rw-r--r-- 1 root root 1 Oct 31 13:57 app.py

%%writefile app.py
import streamlit as st
import pandas as pd
import spacy
import json
import os
import tempfile
import networkx as nx
from pyvis.network import Network
from io import BytesIO
import datetime

# ----------------------------------------------------------
# PAGE CONFIG
# ----------------------------------------------------------
st.set_page_config(
    page_title="KnowVerse | AI Knowledge Explorer",
    layout="wide",
    page_icon="🌌",
)

# ----------------------------------------------------------
# THEME STYLE — DEEP BLUE PROFESSIONAL
# ----------------------------------------------------------
st.markdown("""
    
""", unsafe_allow_html=True)

# ----------------------------------------------------------
# USER DATABASE
# ----------------------------------------------------------
USER_DB = "users.json"
if not os.path.exists(USER_DB):
    with open(USER_DB, "w") as f:
        json.dump({}, f)

def load_users():
    with open(USER_DB, "r") as f:
        return json.load(f)

def save_users(data):
    with open(USER_DB, "w") as f:
        json.dump(data, f, indent=2)

# ----------------------------------------------------------
# SIDEBAR NAVIGATION
# ----------------------------------------------------------
st.sidebar.image("https://cdn-icons-png.flaticon.com/512/9805/9805633.png", width=90)
st.sidebar.markdown("🌌 KnowVerse", unsafe_allow_html=True)
st.sidebar.markdown("AI-Powered Knowledge Explorer")

menu = st.sidebar.radio(
    "🌍 Navigation Menu",
    [
        "🏠 Home",
        "🔑 Login",
        "🆕 Register",
        "📂 Dataset Management",
        "🧠 NLP Extraction",
        "🌐 Knowledge Graph",
        "🛠 Admin Dashboard",
        "💬 Feedback"
    ]
)

# ----------------------------------------------------------
# ROBUST CSV LOADER
# ----------------------------------------------------------
def load_dataframe(uploaded_file):
    uploaded_file.seek(0)
    try:
        df = pd.read_csv(uploaded_file, sep=None, engine="python", header=0)
    except Exception:
        uploaded_file.seek(0)
        df = pd.read_csv(uploaded_file, sep=None, engine="python", header=None)
    lower_cols = [str(c).lower() for c in df.columns]
    if not {"entity_1", "relation", "entity_2"}.issubset(set(lower_cols)):
        if df.shape[1] >= 9:
            df.columns = [
                "id","entity_1","relation","entity_2",
                "domain","country","start_year","end_year","notes"
            ]
        elif df.shape[1] >= 3:
            df.columns = ["entity_1","relation","entity_2"] + [f"col{i}" for i in range(df.shape[1]-3)]
    return df

# ----------------------------------------------------------
# PAGE 1: HOME
# ----------------------------------------------------------
if menu == "🏠 Home":
    st.title("🌌 Welcome to KnowVerse")
    st.subheader("A Smarter Way to Explore Knowledge Across Domains")
    st.markdown("""
        Discover hidden connections between entities, relations, and ideas with AI-powered graph exploration.
        Upload datasets, extract triples, and visualize interactive knowledge networks — all in one tool.
        ---
        🧩 Features include:
        - Automated entity & relation extraction
        - Cross-domain knowledge graphs
        - Admin & feedback management
    """)

# ----------------------------------------------------------
# PAGE 2: LOGIN
# ----------------------------------------------------------
elif menu == "🔑 Login":
    st.title("🔑 Login to KnowVerse")
    users = load_users()
    email = st.text_input("📧 Email")
    pw = st.text_input("🔒 Password", type="password")
    if st.button("Login 🚀"):
        if email in users and users[email]["password"] == pw:
            st.session_state["logged_in"] = email
            st.success(f"Welcome back, {email}!")
        elif email in users:
            st.error("❌ Incorrect password.")
        else:
            st.warning("⚠️ User not found. Please register first.")

# ----------------------------------------------------------
# PAGE 3: REGISTER
# ----------------------------------------------------------
elif menu == "🆕 Register":
    st.title("🆕 Create Your KnowVerse Account")
    users = load_users()
    new_email = st.text_input("📧 Email")
    new_pw = st.text_input("🔑 Password", type="password")
    if st.button("Register ✨"):
        if new_email in users:
            st.warning("⚠️ This email is already registered.")
        elif not new_email or not new_pw:
            st.error("❌ Please fill in all fields.")
        else:
            users[new_email] = {"password": new_pw}
            save_users(users)
            st.success("🎉 Registration successful! You can now log in.")

# ----------------------------------------------------------
# PAGE 4: DATASET MANAGEMENT
# ----------------------------------------------------------
elif menu == "📂 Dataset Management":
    st.title("📂 Dataset Management")
    if "logged_in" not in st.session_state:
        st.warning("Please log in to access this section.")
    else:
        upload_type = st.radio("Choose Upload Method", ["📁 CSV Upload", "📝 Text Input"])
        if upload_type == "📁 CSV Upload":
            uploaded_file = st.file_uploader("Upload a dataset file", type=["csv","tsv","txt"])
            if uploaded_file:
                df = load_dataframe(uploaded_file)
                st.session_state["uploaded_df"] = df
                st.success("✅ File uploaded successfully!")
                st.dataframe(df.head(10))
                cols = {c.lower(): c for c in df.columns}
                s_col = cols.get("entity_1") or cols.get("subject")
                p_col = cols.get("relation") or cols.get("predicate") or cols.get("rel")
                o_col = cols.get("entity_2") or cols.get("object")
                if s_col and p_col and o_col:
                    triples = list(zip(df[s_col].astype(str), df[p_col].astype(str), df[o_col].astype(str)))
                    st.session_state["triples"] = triples
                    st.info(f"Extracted {len(triples)} triples.")
        else:
            text_input = st.text_area("Paste text data here")
            if text_input:
                st.session_state["text_data"] = text_input
                st.success("✅ Text data stored for extraction!")

# ----------------------------------------------------------
# PAGE 5: NLP EXTRACTION
# ----------------------------------------------------------
elif menu == "🧠 NLP Extraction":
    st.title("🧠 Entity & Relation Extraction")
    if "logged_in" not in st.session_state:
        st.warning("Please log in first.")
    else:
        def extract_triples(text: str):
            try:
                nlp_local = spacy.load("en_core_web_sm")
            except Exception:
                st.error("spaCy model not found. Run: `python -m spacy download en_core_web_sm`")
                return []
            doc = nlp_local(text)
            triples = []
            for sent in doc.sents:
                root = next((t for t in sent if t.dep_ == "ROOT"), None)
                if not root: continue
                subj = next((w for w in root.lefts if "subj" in w.dep_), None)
                obj = next((w for w in root.rights if "obj" in w.dep_ or w.dep_ == "pobj"), None)
                if subj and obj:
                    triples.append((subj.text, root.lemma_, obj.text))
            return triples

        if st.button("🔍 Extract from Saved Dataset"):
            triples = st.session_state.get("triples", [])
            if triples:
                st.success(f"Found {len(triples)} existing triples.")
                st.dataframe(pd.DataFrame(triples, columns=["Subject","Relation","Object"]))
            else:
                st.info("No saved dataset found.")
        text = st.text_area("Or enter your own text:")
        if st.button("🚀 Run Extraction"):
            triples = extract_triples(text)
            st.session_state["triples"] = triples
            st.success("Extraction completed!")
            st.dataframe(pd.DataFrame(triples, columns=["Subject","Relation","Object"]))

# ----------------------------------------------------------
# PAGE 6: KNOWLEDGE GRAPH
# ----------------------------------------------------------
elif menu == "🌐 Knowledge Graph":
    st.title("🌐 Knowledge Graph Explorer")
    triples = st.session_state.get("triples", [])
    if not triples:
        st.warning("No triples to visualize.")
    else:
        show_labels = st.checkbox("Show relation labels", value=False)
        G = nx.Graph()
        for s, p, o in triples:
            G.add_node(s)
            G.add_node(o)
            G.add_edge(s, o, relation=p)
        net = Network(height="700px", width="100%", bgcolor="#0b132b", font_color="white")
        for n in G.nodes():
            net.add_node(n, label=n, color="#5bc0be")
        for u, v, d in G.edges(data=True):
            rel = d.get("relation", "")
            edge_kwargs = {"title": rel}
            if show_labels:
                edge_kwargs["label"] = rel
            net.add_edge(u, v, **edge_kwargs)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".html")
        net.write_html(tmp.name)
        with open(tmp.name) as f:
            st.components.v1.html(f.read(), height=720, scrolling=True)
        os.unlink(tmp.name)

# ----------------------------------------------------------
# PAGE 7: ADMIN DASHBOARD (Milestone 4)
# ----------------------------------------------------------
elif menu == "🛠 Admin Dashboard":
    st.header("🛠 Admin Dashboard — Graph & User Management (Milestone 4)")

    ADMIN_LOG = "admin_log.json"
    BACKUP_DIR = "kg_backups"
    os.makedirs(BACKUP_DIR, exist_ok=True)

    def log_admin(action, detail=""):
        entry = {"ts": datetime.datetime.utcnow().isoformat() + "Z", "action": action, "detail": detail}
        logs = []
        if os.path.exists(ADMIN_LOG):
            try:
                with open(ADMIN_LOG, "r") as f:
                    logs = json.load(f)
            except Exception:
                logs = []
        logs.insert(0, entry)
        with open(ADMIN_LOG, "w") as f:
            json.dump(logs[:200], f, indent=2)

    def build_graph_from_session():
        triples = st.session_state.get("triples", [])
        G = nx.Graph()
        for s, p, o in triples:
            G.add_node(s); G.add_node(o)
            G.add_edge(s, o, relation=p)
        return G

    def triples_from_graph(G):
        triples = []
        for u, v, data in G.edges(data=True):
            triples.append((u, data.get("relation", ""), v))
        return triples

    G_admin = build_graph_from_session()
    st.subheader("Quick stats")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Nodes", G_admin.number_of_nodes())
    c2.metric("Edges", G_admin.number_of_edges())
    degrees = dict(G_admin.degree())
    top_nodes = sorted(degrees.items(), key=lambda x: x[1], reverse=True)[:5]
    c3.metric("Top node degree", top_nodes[0][1] if top_nodes else 0)
    rels = {}
    for _,_,d in G_admin.edges(data=True):
        rels[d.get("relation","")] = rels.get(d.get("relation",""), 0) + 1
    top_rels = sorted(rels.items(), key=lambda x: x[1], reverse=True)[:3]
    c4.metric("Top relation (count)", f"{top_rels[0][0]} ({top_rels[0][1]})" if top_rels else "N/A")

    st.markdown("---")
    st.subheader("Manual Graph Controls")

    col_a, col_b = st.columns([2,2])
    node_to_rename = col_a.text_input("Node to rename (exact)", key="admin_rename_from")
    node_new_name = col_b.text_input("New name", key="admin_rename_to")
    if st.button("Rename Node"):
        if not node_to_rename or not node_new_name:
            st.error("Provide both existing node name and new name.")
        elif node_to_rename not in G_admin:
            st.error("Node not found in current graph.")
        else:
            ts = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            backup_path = os.path.join(BACKUP_DIR, f"backup_before_rename_{ts}.json")
            with open(backup_path, "w") as f: json.dump(triples_from_graph(G_admin), f)
            nx.relabel_nodes(G_admin, {node_to_rename: node_new_name}, copy=False)
            st.session_state["triples"] = triples_from_graph(G_admin)
            log_admin("rename_node", f"{node_to_rename} -> {node_new_name}")
            st.success(f"Renamed '{node_to_rename}' to '{node_new_name}'. Backup: {backup_path}")

    merge_a = st.text_input("Merge Node A (target)", key="admin_merge_a")
    merge_b = st.text_input("Merge Node B (source)", key="admin_merge_b")
    if st.button("Merge Nodes"):
        if not merge_a or not merge_b:
            st.error("Provide both node names.")
        elif merge_a not in G_admin or merge_b not in G_admin:
            st.error("One or both nodes not found.")
        else:
            ts = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            backup_path = os.path.join(BACKUP_DIR, f"backup_before_merge_{ts}.json")
            with open(backup_path, "w") as f: json.dump(triples_from_graph(G_admin), f)
            for nbr in list(G_admin.neighbors(merge_b)):
                if not G_admin.has_edge(merge_a, nbr) and nbr != merge_a:
                    G_admin.add_edge(merge_a, nbr, **G_admin.edges[merge_b, nbr])
            G_admin.remove_node(merge_b)
            st.session_state["triples"] = triples_from_graph(G_admin)
            log_admin("merge_nodes", f"{merge_b} -> {merge_a}")
            st.success(f"Merged '{merge_b}' into '{merge_a}'. Backup: {backup_path}")
# ----------------------------------------------------------
# PAGE 8: FEEDBACK
# ----------------------------------------------------------
elif menu == "💬 Feedback":
    st.title("💬 Share Your Experience")
    rating = st.slider("Rate KnowVerse", 1, 5, 4)
    comments = st.text_area("Comments")
    if st.button("Submit Feedback"):
        feedback = {
            "rating": rating,
            "comments": comments,
            "user": st.session_state.get("logged_in", "Anonymous"),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        with open("feedback.json", "a") as f:
            f.write(json.dumps(feedback) + "\n")
        st.success("Thanks for your feedback 💫")

     
Overwriting app.py

!ls -lh app.py

     
-rw-r--r-- 1 root root 15K Oct 31 13:57 app.py

from pyngrok import ngrok
ngrok.set_auth_token("32Ygx5dT1y9j614HOQjMr6NamI8_7zrRW3qKUmxmtZ7KWw2NH")
port = 8501
!fuser -k 8501/tcp || true
get_ipython().system_raw(f"streamlit run app.py --server.port {port} --server.headless true &")
tunnels = ngrok.get_tunnels()
if tunnels:
    public_url = tunnels[0].public_url
else:
    public_url = ngrok.connect(addr=port, proto="http").public_url
print("🔗 App URL:", public_url)




     
8501/tcp:            11157
🔗 App URL: https://e7d69f6de349.ngrok-free.app
