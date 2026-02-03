import streamlit as st
import json
import os
from learning_engine import LearningEngine

# Page Config
st.set_page_config(page_title="AI Learning OS", page_icon="🧠", layout="wide")

# Load Engine
engine = LearningEngine()

# Session State for User Data
if 'user_profile' not in st.session_state:
    st.session_state.user_profile = {
        "role": "Aspiring AI Engineer",
        "goal": "Build Agents",
        "time_per_day": "45 mins",
        "style": "Code-First",
        "skills": "Python, Basic LLMs"
    }
if 'roadmap' not in st.session_state:
    st.session_state.roadmap = None

# Sidebar - User Profile
with st.sidebar:
    st.title("👤 User Profile")
    st.session_state.user_profile['role'] = st.text_input("Current Role", st.session_state.user_profile['role'])
    st.session_state.user_profile['goal'] = st.text_input("Learning Goal", st.session_state.user_profile['goal'])
    st.session_state.user_profile['time_per_day'] = st.selectbox("Time/Day", ["15 mins", "30 mins", "45 mins", "1 hour"])
    
    if st.button("Generate/Reset Roadmap"):
        with st.spinner("Architecting your journey..."):
            st.session_state.roadmap = engine.generate_curriculum(st.session_state.user_profile)
        st.success("Roadmap Updated!")

# Main Area
st.title("🧠 Personalized AI Learning System")
st.markdown("*Your adaptive path to mastery.*")

# Navigation (Radio instead of Tabs for programmatic control)
if 'nav' not in st.session_state:
    st.session_state.nav = "🗺️ Roadmap"

selected_tab = st.radio(
    "Navigate", 
    ["🗺️ Roadmap", "📚 Today's Lesson", "🌐 Ecosystem Pulse"], 
    horizontal=True,
    key="nav"
)

def start_day(t, d):
    st.session_state.nav = "📚 Today's Lesson"
    st.session_state.current_topic = t
    st.session_state.current_day = d

if selected_tab == "🗺️ Roadmap":
    if st.session_state.roadmap and 'roadmap' in st.session_state.roadmap:
        st.subheader("Your 7-Day Sprint")
        for item in st.session_state.roadmap['roadmap']:
            with st.expander(f"Day {item['day']}: {item['topic']}"):
                st.write(f"**Objective:** {item['objective']}")
                st.write(f"**Action:** {item['action']}")
                # Pass arguments to the callback to handle ALL state updates reliably
                st.button(f"Start Day {item['day']}", key=f"btn_{item['day']}", on_click=start_day, args=(item['topic'], item['day']))
    else:
        st.info("👈 Click 'Generate Roadmap' in the sidebar to start.")

elif selected_tab == "📚 Today's Lesson":
    if 'current_topic' in st.session_state:
        st.header(f"Day {st.session_state.get('current_day', 1)}: {st.session_state.current_topic}")
        if st.button("Generate Lesson Content"):
            with st.spinner("Synthesizing lesson..."):
                lesson = engine.generate_daily_lesson(st.session_state.current_topic, st.session_state.user_profile)
                st.markdown(lesson)
                st.balloons()
    else:
        st.write("Select a day from the Roadmap to begin.")

elif selected_tab == "🌐 Ecosystem Pulse":
    st.subheader("What's Changing in AI?")
    if st.button("Scan Ecosystem"):
        with st.spinner("Scanning trends..."):
            updates = engine.get_ecosystem_updates(st.session_state.user_profile['goal'])
            st.markdown(updates)
