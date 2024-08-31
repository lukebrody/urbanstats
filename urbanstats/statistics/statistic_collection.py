from abc import ABC, abstractmethod

ORDER_CATEGORY_MAIN = 0
ORDER_CATEGORY_OTHER_DENSITIES = 1


class StatisticCollection(ABC):
    def __init__(self):
        quiz_overlaps = set(self.quiz_question_unused()) & set(
            self.quiz_question_names()
        )
        assert (
            not quiz_overlaps
        ), f"Quiz questions both used and unused: {quiz_overlaps}"
        quiz_questions = set(self.quiz_question_names()) | set(
            self.quiz_question_unused()
        )
        all_columns = set(self.name_for_each_statistic())
        extra_quiz_questions = quiz_questions - all_columns
        assert not extra_quiz_questions, f"Extra quiz questions: {extra_quiz_questions}"
        missing_quiz_questions = all_columns - quiz_questions
        assert (
            not missing_quiz_questions
        ), f"Missing quiz questions: {missing_quiz_questions}"

    @abstractmethod
    def name_for_each_statistic(self):
        pass

    @abstractmethod
    def category_for_each_statistic(self):
        pass

    @abstractmethod
    def explanation_page_for_each_statistic(self):
        pass

    @abstractmethod
    def quiz_question_names(self):
        pass

    def quiz_question_unused(self):
        return ()

    @abstractmethod
    def mutate_statistic_table(self, statistics_table, shapefile_table):
        pass

    @abstractmethod
    def for_america(self):
        pass

    @abstractmethod
    def for_international(self):
        pass

    def order_category_for_each_statistic(self):
        return self.same_for_each_name(ORDER_CATEGORY_MAIN)

    def same_for_each_name(self, value):
        return {name: value for name in self.name_for_each_statistic()}

    def extra_stats(self):
        return {}


class GeographicStatistics(StatisticCollection):
    def for_america(self):
        return True

    def for_international(self):
        return True


class InternationalStatistics(StatisticCollection):
    def for_america(self):
        return False

    def for_international(self):
        return True


class CensusStatisticsColection(StatisticCollection):
    # TODO we should probably have this actually pull the census data, it currently does not.
    def for_america(self):
        return True

    def for_international(self):
        return False


class CDCStatisticsCollection(StatisticCollection):
    # TODO we should probably have this actually pull the CDC data, it currently does not.
    def for_america(self):
        return True

    def for_international(self):
        return False


class ACSStatisticsColection(StatisticCollection):
    @abstractmethod
    def acs_name(self):
        pass

    @abstractmethod
    def acs_entity(self):
        pass

    def acs_entity_dict(self):
        return {self.acs_name(): self.acs_entity()}

    def for_america(self):
        return True

    def for_international(self):
        return False


class ACSUSPRStatisticsColection(StatisticCollection):
    @abstractmethod
    def acs_name(self):
        pass

    @abstractmethod
    def acs_entities(self):
        pass

    def acs_entity_dict(self):
        return {self.acs_name(): self.acs_entities()}

    def for_america(self):
        return True

    def for_international(self):
        return False


class USElectionStatisticsCollection(StatisticCollection):
    # TODO we should probably have this actually pull the election data, it currently does not.
    def for_america(self):
        return True

    def for_international(self):
        return False


class USFeatureDistanceStatisticsCollection(StatisticCollection):
    # TODO we should probably have this actually pull the feature data, it currently does not.
    def for_america(self):
        return True

    def for_international(self):
        return False


class USWeatherStatisticsCollection(StatisticCollection):
    # TODO we should probably have this actually pull the weather data, it currently does not.
    def for_america(self):
        return True

    def for_international(self):
        return False
