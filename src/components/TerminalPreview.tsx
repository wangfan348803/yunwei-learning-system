import React, { useState } from 'react'
import { getCommandPreview } from '../data/commandPreviews'
import { isExecutableCommand } from '../logic/commandClassify'

interface TerminalPreviewProps {
  relatedCommand: string | undefined
}

/** Interactive terminal preview with command structure breakdown and output simulation. */
export const TerminalPreview = React.memo(function TerminalPreview({ relatedCommand }: TerminalPreviewProps) {
  const [terminalTab, setTerminalTab] = useState<'breakdown' | 'output'>('breakdown')
  const [hoveredToken, setHoveredToken] = useState<number | null>(null)

  if (!relatedCommand || !isExecutableCommand(relatedCommand)) {
    return null
  }

  const preview = getCommandPreview(relatedCommand)

  return (
    <div className="terminal-preview-container">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <span className="terminal-title">bash - Terminal</span>
        <div className="terminal-tabs">
          <button
            className={`terminal-tab ${terminalTab === 'breakdown' ? 'active' : ''}`}
            onClick={() => setTerminalTab('breakdown')}
          >
            命令结构拆解
          </button>
          <button
            className={`terminal-tab ${terminalTab === 'output' ? 'active' : ''}`}
            onClick={() => setTerminalTab('output')}
          >
            终端输出预览
          </button>
        </div>
      </div>
      
      <div className="terminal-body">
        {terminalTab === 'breakdown' ? (
          <div className="terminal-breakdown-pane">
            <div className="command-tokens-list">
              {preview.tokens.map((token, idx) => (
                <span
                  key={idx}
                  className={`token-capsule ${token.type} ${hoveredToken === idx ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredToken(idx)}
                  onMouseLeave={() => setHoveredToken(null)}
                  onFocus={() => setHoveredToken(idx)}
                  onBlur={() => setHoveredToken(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${token.text}: ${token.description}`}
                >
                  {token.text}
                </span>
              ))}
            </div>
            <div className="token-explanation-box">
              {hoveredToken !== null && preview.tokens[hoveredToken] ? (
                <div className="hovered-token-detail">
                  <span className={`token-type-badge ${preview.tokens[hoveredToken].type}`}>
                    {preview.tokens[hoveredToken].type === 'command' && '命令'}
                    {preview.tokens[hoveredToken].type === 'option' && '选项'}
                    {preview.tokens[hoveredToken].type === 'argument' && '参数'}
                    {preview.tokens[hoveredToken].type === 'operator' && '操作符'}
                  </span>
                  <strong>{preview.tokens[hoveredToken].text}</strong>
                  <span className="token-desc-arrow">→</span>
                  <span className="token-desc-text">{preview.tokens[hoveredToken].description}</span>
                </div>
              ) : (
                <div className="token-placeholder">
                  💡 鼠标悬浮或Tab聚焦于命令词上可查看详细的技术参数拆解与释义
                </div>
              )}
            </div>
            <div className="token-table-wrapper">
              <table className="token-explanation-table">
                <thead>
                  <tr>
                    <th>组成部分</th>
                    <th>类别</th>
                    <th>技术释义与作用</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.tokens.map((token, idx) => (
                    <tr
                      key={idx}
                      className={hoveredToken === idx ? 'highlighted-row' : ''}
                      onMouseEnter={() => setHoveredToken(idx)}
                      onMouseLeave={() => setHoveredToken(null)}
                    >
                      <td><code className="token-code">{token.text}</code></td>
                      <td>
                        <span className={`token-type-badge ${token.type}`}>
                          {token.type === 'command' && '命令'}
                          {token.type === 'option' && '选项'}
                          {token.type === 'argument' && '参数'}
                          {token.type === 'operator' && '操作符'}
                        </span>
                      </td>
                      <td>{token.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="terminal-output-pane">
            <pre className="terminal-output-text">
              {preview.output}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
})

export default TerminalPreview
