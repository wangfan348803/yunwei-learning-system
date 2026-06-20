import React, { useMemo, useState } from 'react'
import {
  bossCitySnapshots,
  defaultBossCityKey,
  getBossSearchUrl,
  type BossCityKey,
} from '../data/bossJobSnapshots'
import { categories } from '../data/questions'
import type { CategoryId } from '../types'

/** Salary text BOSS returns for logged-out scrapes carries no real information. */
const isPlaceholderSalary = (salary: string) => !salary || /登录后可见|未公开/.test(salary)

interface JobBoardProps {
  /** Jump to a question-bank category so the recruitment sample drives practice. */
  onPractice?: (categoryId: CategoryId) => void
}

export const JobBoard = React.memo(function JobBoard({ onPractice }: JobBoardProps) {
  const [activeCityKey, setActiveCityKey] = useState<BossCityKey>(defaultBossCityKey)
  const activeSnapshot = useMemo(
    () => bossCitySnapshots.find((snapshot) => snapshot.key === activeCityKey) ?? bossCitySnapshots[0],
    [activeCityKey],
  )
  const duplicatedJobs = useMemo(
    () => [...activeSnapshot.jobs, ...activeSnapshot.jobs],
    [activeSnapshot.jobs],
  )
  const isSynced = activeSnapshot.status === 'synced'

  return (
    <div className="job-board-card">
      <div className="job-board-header">
        <div className="job-board-heading">
          <div className="job-board-title">
            <span className="brand-dot" />
            BOSS直聘 · 运维岗位城市样本
          </div>
          <div className="job-board-subtitle">
            地区: <span className="stat-highlight">{activeSnapshot.cityName}</span>
            {' | '}
            样本岗位: <span className="stat-highlight">{activeSnapshot.sampledJobs}</span>
            {' | '}
            有效详情: <span className="stat-highlight">{activeSnapshot.usableDetails}</span>
            {' | '}
            {isSynced ? (
              <>
                采样: <span className="stat-highlight">{activeSnapshot.sampledAt}</span>
                {' | '}
                来源: <span className="stat-highlight">{activeSnapshot.sourceLabel}</span>
              </>
            ) : (
              <>
                状态: <span className="stat-highlight">待同步</span>
              </>
            )}
          </div>
        </div>

        <div className="job-city-tabs" role="tablist" aria-label="切换BOSS城市">
          {bossCitySnapshots.map((snapshot) => {
            const active = snapshot.key === activeCityKey
            return (
              <button
                key={snapshot.key}
                type="button"
                role="tab"
                aria-selected={active}
                data-city-key={snapshot.key}
                className={`job-city-tab ${active ? 'active' : ''} ${snapshot.status === 'pending' ? 'pending' : ''}`}
                onClick={() => setActiveCityKey(snapshot.key)}
              >
                <span>{snapshot.cityName}</span>
                {snapshot.status === 'pending' && <span className="job-city-tab-badge">待同步</span>}
              </button>
            )
          })}
        </div>
      </div>

      {onPractice && (
        <div className="job-practice-bridge">
          <span className="job-practice-label">岗位能力要求已融入题库，去针对性练习：</span>
          <div className="job-practice-chips">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="job-practice-chip"
                style={{ '--chip-accent': category.accent } as React.CSSProperties}
                onClick={() => onPractice(category.id)}
                title={`练习「${category.name}」题库`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSnapshot.jobs.length > 0 ? (
        <div className="job-marquee-viewport">
          <div className="job-marquee-track">
            {duplicatedJobs.map((job, idx) => {
              const searchUrl = job.url || getBossSearchUrl(activeSnapshot.cityName, `${job.company} ${job.title}`)
              return (
                <a
                  key={`${job.id}-${idx}`}
                  className="job-item"
                  href={searchUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`点击去BOSS直聘查看/搜索 ${job.company} ${job.title}`}
                >
                  <div className="job-main-info">
                    <div className="job-meta-line">
                      <span className="job-title">{job.title}</span>
                      {!isPlaceholderSalary(job.salary) && <span className="job-salary">{job.salary}</span>}
                    </div>
                    <div className="job-meta-line">
                      <span className="job-company">{job.company}</span>
                      <span className="job-city">{job.city}</span>
                      <div className="job-tags">
                        {job.tags.map((tag) => (
                          <span key={tag} className="job-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="job-right-info">
                    <span className="job-time">{job.sourceRank}</span>
                    <span className="job-source">BOSS样本</span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="job-empty-state">
          <div>
            <strong className="job-empty-title">{activeSnapshot.cityName}暂未同步真实快照</strong>
            <p className="job-empty-copy">
              当前不会展示模拟岗位。同步完成后，这里会显示该城市从 BOSS 采集到的真实运维岗位、薪资、公司与技术标签。
            </p>
          </div>
          <a
            className="job-empty-action"
            href={getBossSearchUrl(activeSnapshot.cityName)}
            target="_blank"
            rel="noreferrer"
          >
            去BOSS搜索
          </a>
        </div>
      )}
    </div>
  )
})

export default JobBoard
