"use client";

import { useState } from 'react';
import { useTranslation } from '../lib/i18n';

export default function Subscribe() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Simulate an API call
    try {
      // In a real project this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage(t('subscribe.success'));
      setEmail('');
    } catch (error) {
      setMessage(t('subscribe.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="subscribe">
      <div className="subscribe-content">
        <h2>{t('subscribe.title')}</h2>
        <p>{t('subscribe.subtitle')}</p>
        <form className="subscribe-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder={t('subscribe.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('subscribe.submitting') : t('subscribe.button')}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </section>
  );
}