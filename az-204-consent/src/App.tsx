import { useEffect, useState } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from './authConfig'
import './App.css'

interface CalendarEvent {
  id: string
  subject: string
  start: { dateTime: string }
  end: { dateTime: string }
  isAllDay?: boolean
  showAs?: string
  onlineMeeting?: { joinUrl?: string }
}

interface Team {
  id: string
  displayName: string
  description?: string
}

interface CalendarViewProps {
  accessToken: string
}

const CalendarView = ({ accessToken }: CalendarViewProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('')

  const fetchEvents = (start: string, end: string) => {
    fetch(`https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${start}&endDateTime=${end}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setEvents(data.value || []))
  }

  const fetchTeamsCurrentlyIn = () => {
    fetch(`https://graph.microsoft.com/v1.0/me/joinedTeams`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => res.json())
      .then((data) => setTeams(data.value || []))
  }

  useEffect(() => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const start = `${dateStr}T00:00:00Z`
    const end = `${dateStr}T23:59:59Z`
    fetchEvents(start, end)
    fetchTeamsCurrentlyIn()
  }, [accessToken])

  const filteredEvents = events.filter((e) =>
    e.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Today's Events</h2>
        <input
          className="search-input"
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Events</h3>
          <ul className="event-list">
            {filteredEvents.map((event) => (
              <li className="event-item" key={event.id}>
                <div className="event-title">{event.subject}</div>
                <div className="event-time">
                  {new Date(event.start.dateTime).toLocaleTimeString()} -{' '}
                  {new Date(event.end.dateTime).toLocaleTimeString()}
                </div>
                {event.onlineMeeting?.joinUrl && (
                  <a
                    className="meeting-link"
                    href={event.onlineMeeting.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Teams You're In</h3>
          <ul className="team-list">
            {teams.map((team) => (
              <li className="team-item" key={team.id}>
                <div className="team-name">{team.displayName}</div>
                {team.description && <p className="team-description">{team.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const handleLogin = () => {
    instance.loginPopup(loginRequest).then((loginResponse) => {
      instance
        .acquireTokenSilent({ ...loginRequest, account: loginResponse.account })
        .then((response) => setAccessToken(response.accessToken))
    })
  }

  const handleLogout = () => {
    instance.logoutPopup()
  }

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      instance
        .acquireTokenSilent({ ...loginRequest, account: accounts[0] })
        .then((response) => setAccessToken(response.accessToken))
        .catch(() => {
          instance
            .acquireTokenPopup(loginRequest)
            .then((response) => setAccessToken(response.accessToken))
        })
    }
  }, [isAuthenticated, instance, accounts])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="flex">
          <h1>📅 Calendar Planner</h1>
        <div className="button-container">
          {!isAuthenticated ? (
            <button className="login-button" onClick={handleLogin}>Sign in with Microsoft</button>
          ) : (
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          )}
        </div>
        </div>
      </header>
      {isAuthenticated && accessToken && <CalendarView accessToken={accessToken} />}
    </div>
  )
}

export default App
