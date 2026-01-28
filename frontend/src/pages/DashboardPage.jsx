import React from "react";
import React from 'react'
export default function DashboardPage(){
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Recent Activity</h5>
              <p className="card-text">No activity yet — try asking a question.</p>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-flex gap-2">
                <a href="/ask" className="btn btn-primary">Ask a question</a>
                <a href="/topics" className="btn btn-outline-secondary">Browse topics</a>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h6>Summary</h6>
              <p className="small">Mocked AI assistant ready.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
