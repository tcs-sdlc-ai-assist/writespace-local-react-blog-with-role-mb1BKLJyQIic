import PropTypes from 'prop-types';

/**
 * StatCard component for admin dashboard stat tiles.
 * Displays a label, value, and icon with Tailwind styling.
 * @param {object} props
 * @param {string} props.title - The label for the statistic.
 * @param {string|number} props.value - The statistic value to display.
 * @param {string} props.icon - The emoji or icon string to render.
 * @param {'primary' | 'secondary' | 'success' | 'warning' | 'error'} [props.color='primary'] - The color theme for the card.
 * @returns {JSX.Element}
 */
export function StatCard({ title, value, icon, color = 'primary' }) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      icon: 'bg-primary-100 text-primary-600',
    },
    secondary: {
      bg: 'bg-secondary-50',
      text: 'text-secondary-700',
      icon: 'bg-secondary-100 text-secondary-600',
    },
    success: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: 'bg-success-50 text-success-700',
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      icon: 'bg-warning-50 text-warning-700',
    },
    error: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      icon: 'bg-error-50 text-error-700',
    },
  };

  const scheme = colorClasses[color] || colorClasses.primary;

  return (
    <div
      className={`${scheme.bg} rounded-2xl p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-fade-in`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${scheme.text}`}>{value}</p>
        </div>
        <div
          className={`${scheme.icon} inline-flex h-12 w-12 items-center justify-center rounded-xl text-xl flex-shrink-0`}
          role="img"
          aria-label={title}
        >
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
};

export default StatCard;