package com.yb.feedback360.dto.response;

import java.util.List;

// counts.get(0) = nombre de 1★, … counts.get(4) = nombre de 5★.
public record RatingDistributionResponse(List<Long> counts) {}